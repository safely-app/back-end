import json
import time
import schedule
import requests
import subprocess
from dotenv import dotenv_values

config = dotenv_values(".env")

def runAuthServiceKarate():
    subprocess.run('./bin/auth-service/karate', shell=True)

def sendReport():
    log = "bashupload.log"
    with open(log) as f:
        bashlog = f.readlines()

    reportUrl = bashlog[0]
    filename = "./tests/karate/karate-0.9.6/target/karate-reports/karate-summary-json.txt"

    file = open(filename ,mode='r')
    content = file.read()
    file.close()
    y = json.loads(content)
    failedCount = y["featureSummary"][0]["failedCount"]
    print(failedCount) 

    url = config["DISCORD_WEBHOOK_URL"]

    data = {}
    if not (failedCount):
        data["embeds"] = [
            {
                "title" : "Karate: all tests passed",
                "color": "6606392"
            }
        ]
    else:
        data["embeds"] = [
        {
            "description" : "Karate ended with " + str(failedCount) + " failed tests: " + reportUrl,
            "title" : "Karate tests failed",
            "color": "14177041"
        }
        ]

    result = requests.post(url, json = data)
    try:
        result.raise_for_status()
    except requests.exceptions.HTTPError as err:
        print(err)
    else:
        print("Payload delivered successfully, code {}.".format(result.status_code))

def job():
    runAuthServiceKarate()
    time.sleep(30)
    sendReport()

schedule.every().day.at("09:10").do(job)

while True:
    schedule.run_pending()
    time.sleep(60)