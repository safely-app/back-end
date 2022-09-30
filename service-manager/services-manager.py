import flask
from flask import request, jsonify

app = flask.Flask(__name__)
app.config["DEBUG"] = True

def getLines(path):
    my_file = open(path, "r")
    content = my_file.read()
    lines = content.split("\n")
    my_file.close()
    return lines

def getPort(services, lines):
    for service in services:
        for line in lines:
            if line.find("localhost") != -1 and \
            line.find(service["name"] + '}') != -1 and \
            line.find("ProxyPass") != -1:
                port = line.split(':')[2][:-1]
                service['port'] = int(port)
    return services

def getServices(lines):
    services = []
    routes = lines[lines.index('#/ROUTES')+1:lines.index('#ROUTES/')]
    for idx, route in enumerate(routes):
        service = {}
        service["name"] = route.split(" ")[1]
        service["path"] = route.split(" ")[2]
        services.append(service)
    services = getPort(services, lines)
    return services


def deleteService(name, lines):
    suffixs = ["}", " "] 
    for suffix in suffixs:
        lines = [line for line in lines if name + suffix not in line]
        with open('services.conf','w+') as f:
            for i in lines:
                if i == lines[-1]:
                    f.write('%s'%i)
                else:
                    f.write('%s\n'%i)

def validator(value, attribute, services):
    for service in services:
        serviceValue = service[attribute]
        if (attribute == "path"):
            serviceValue = serviceValue.replace('"', '')
        if (value == serviceValue):
            return {"error": "Binding error: " + str(attribute) + " " + str(service[attribute]) + " already in use !"}
    return 0


def checkFileQuality(lines):
    jsonResponse = []
    tags = ["#/ROUTES", "#/HEADERS", "#/PROXYPASS",
                "#ROUTES/", "#HEADERS/", "#PROXYPASS/",
               ]
    for tag in tags:
        if (len([s for s in lines if tag in s]) != 1):
            return {"error": "File error: A tag is missing !"}

    routesServices = len(lines[lines.index('#/ROUTES')+1:lines.index('#ROUTES/')])
    headersServices =  len(lines[lines.index('#/HEADERS')+1:lines.index('#HEADERS/')])
    proxyServices = len(lines[lines.index('#/PROXYPASS')+1:lines.index('#PROXYPASS/')]) / 2
    if (routesServices == headersServices and headersServices == proxyServices):
        return 0
    return {"error": "File error: Service modules doesn't match !"}


def addService(name, path, port, lines):
    new_route = 'Define ' + name + ' "' + path + '"'
    new_header = '  RequestHeader set X-Public-Product-Service-Route "${' + name + '}"'
    new_proxy = '    ProxyPass "${' + name + '}" "http://localhost:' + str(port) + '"'
    new_proxy_reverse = '    ProxyPassReverse "${' + name + '}" "http://localhost:' + str(port) + '"'

    route_idx = lines.index('#ROUTES/')
    lines.insert(route_idx, new_route)

    header_idx = lines.index('#HEADERS/')
    lines.insert(header_idx, new_header)

    proxy_idx = lines.index('#PROXYPASS/')
    lines.insert(proxy_idx, new_proxy_reverse)
    lines.insert(proxy_idx, new_proxy)
    with open('services.conf','w+') as f:
        for i in lines:
           f.write('%s\n'%i)

@app.route('/', methods=['GET'])
def home():
    return '''<h1>Services Manager</h1>'''

@app.route('/services', methods=['GET'])
def api_all():
    lines = getLines("services.conf")
    check = checkFileQuality(lines)
    if (check):
        return (jsonify(check))
    services = getServices(lines)
    return jsonify(services)

@app.route('/config', methods=['GET'])
def api_config():
    lines = getLines("services.conf")
    return jsonify(lines)


@app.route('/create', methods=['GET'])
def api_create():
    attributes = ['name', 'path', 'port']
    name = request.json['name']
    path = request.json['path']
    port = request.json['port']
    lines = getLines("services.conf")
    services = getServices(lines)

    for attribute in attributes:
        check = validator(request.json[attribute], attribute, services)
        if check != 0:
            return jsonify(check)            
    addService(name, path, port, lines)
    return jsonify(name + ": created.")

@app.route('/delete', methods=['GET'])
def api_delete():
    name = request.json['name']
    lines = getLines("services.conf")
    deleteService(name, lines)
    return jsonify(name + ": deleted.")

app.run()