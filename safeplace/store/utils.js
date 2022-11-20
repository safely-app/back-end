import axios from "axios";
import nodemailer from "nodemailer";

import { config } from "./config";
import {Safeplace} from "../database/models";
import fetch from 'node-fetch';
import {orderByDistance} from "geolib";

export async function sendTimetableVerificationEmail(email, id) {
  const transporter = nodemailer.createTransport({
    host: 'in-v3.mailjet.com',
    port: 587,
    auth: {
      user: '067fbf023590a210f21af749b51fb4d9',
      pass: 'd5ee92039cc7e72f0651c2a1847dd55e'
    }
  });

  const mailOptions = {
    from: '"Safely" <safelyfrance@gmail.com>',
    to: email,
    subject: 'Verification of opening hours - Safely',
    html: '<h4><b>Verification of opening hours for Safely</b></h4>' +
        '<p>To verify your opening hours on safely, click on this link:</p>' +
        '<a href=' + config.clientUrl + '/verifyHours/' + id + '>' + config.clientUrl + '/verifyHours/' + id + '</a>' +
        '<br><br>' +
        '<p>Thanks a lot</p>' +
        '<br><br>' +
        '<p>Safely Team</p>'
  }

  try {
    // TODO uncomment to send the emails
    //await transporter.sendMail(mailOptions);
    return {status: 200, message: "Email sent!"};
  } catch (err) {
    return {status: 500, message: "An error occurred while sending email"}
  }
}

export async function cutAfterRadius(coordinates, closest, distance) {
  let safeplaces = [];

  for (const index in closest) {
    let result = (closest[index].latitude - coordinates.latitude) + (closest[index].longitude - coordinates.longitude)
    if (result < 0)
      result *= -1;
    if (result <= distance)
      safeplaces.push(closest[index])
  }
  return safeplaces;
}

export async function calculateMetersWithCoordinates(coordinateA, coordinateB) {
  const latA = coordinateA.lat * (Math.PI / 180);
  const latB = coordinateB.lat * (Math.PI / 180);
  const lonA = coordinateA.lng * (Math.PI / 180);
  const lonB = coordinateB.lng * (Math.PI / 180);

  const result = 6372795.477598 * Math.acos(Math.sin(latA) * Math.sin(latB) + Math.cos(latA) * Math.cos(latB) * Math.cos(lonA - lonB));

  return Math.round(result);
}

export async function filterTooFarSafeplaces(location, maxMeters, safeplaces) {
  let closeEnoughSafeplaces = [];
  const safeplacesCoordinates = safeplaces.map((safeplace) => {
    return {lat: safeplace.coordinate[0], lng: safeplace.coordinate[1]};
  });
  const closest = orderByDistance(location, safeplacesCoordinates);

  for (const close of closest) {
    if (await calculateMetersWithCoordinates(location, close) > maxMeters)
      return closeEnoughSafeplaces;
    closeEnoughSafeplaces.push(close);
  }

  return closeEnoughSafeplaces
}

export async function getMaxMetersOfTrajects(routes) {
  let maxMeters = 0;
  for (const route of routes) {
    if (route.legs[0].distance.value > maxMeters)
      maxMeters = route.legs[0].distance.value;
  }

  return maxMeters;
}

export async function getAnomalies(res, req) {
  //return [JSON.parse('{ "_id" : "6271d7595fd416761d286a86", "userId" : "6152cef3487da44a7de8ceb3", "comment" : "Rue non eclairee", "type" : "Dead End", "score" : 4, "street" : "Rue Schlumberger", "createdAt" : "2022-05-04T01:31:05.179Z", "updatedAt" : "2022-05-04T05:10:15.401Z"}')]
  const supportUrl = process.env.NODE_ENV === 'production' ? config.prod.supportUrl : config.dev.supportUrl;
  let anomalies = await fetch(supportUrl + "anomaly/validated", {method: 'GET', headers: {'Authorization': req.headers.authorization}})

  if (anomalies.status === 401)
    return res.status(401).json({message: "Unauthorized"});
  else if (anomalies.status === 500)
    return res.status(500).json({message: "Internal server error"});
  else
    return await anomalies.json();
}

export async function checkAnomalies(step, anomalies) {
  let splitinstructions = step.html_instructions.split("<b>");
  splitinstructions = splitinstructions[splitinstructions.length - 1].split("</b>")[0];
  splitinstructions = await makeVerboseStreet(splitinstructions);

  return anomalies.filter(o => o.street.split(",")[0].toLowerCase().replace(/[0-9]+ /, "") === splitinstructions.toLowerCase());
}

async function makeVerboseStreet(street) {
  street = street.replace("Pl.", "Place");
  street = street.replace("Rte", "Route");
  street = street.replace("Bd", "Boulevard");
  street = street.replace("av.", "Avenue");
  return street;
}

// ######################################################################
// ################### Create OpenStreetMap Safeplace ###################
// ######################################################################

export async function createOpenStreetMapSafeplace(safeplace) {
  let address = (safeplace.tags["addr:housenumber"] ? safeplace.tags["addr:housenumber"] + ' ' : '') + safeplace.tags["addr:street"];
  let city = safeplace.tags["addr:city"];
  const coordinates = safeplace.lat && safeplace.lon ? {lat: safeplace.lat, lon: safeplace.lon} : safeplace.centroid;
  const type = safeplace.tags.shop;
  const name = safeplace.tags.name ? safeplace.tags.name : safeplace.tags.brand;
  const timetable = getTimetable(safeplace.tags.opening_hours);
  const email = safeplace.tags.email;
  const phone = safeplace.tags.phone;
  const web = safeplace.tags.website;

  if (coordinates && (address === 'undefined' || city === undefined)) {
    const result = await getAddressWithCoords(coordinates)
    if (result) {
      address = result.address;
      city = result.city;
    }
  }

  const doc = {
    name: name,
    city: city,
    address: address,
    coordinate: Object.values(coordinates),
    dayTimetable: timetable,
    type: type,
    email: email,
    phone: phone,
    web: web
  }

  Object.keys(doc).forEach(key => doc[key] === undefined ? delete doc[key] : {});

  if (doc.city === undefined || doc.name === undefined) {
    console.error("Safeplace invalid");
    return;
  }

  Safeplace.findOne({ address: doc.address })
      .then(async (found) => {
        if (found) {
          const updated = await found.update(doc);

          if (updated)
            console.log("Safeplace updated");
          else
            console.error("An error occured");
        } else {
          const created = await Safeplace.create(doc);

          if (created)
            console.log("Safeplace created");
          else
            console.error("An error occured");
        }
      })
}

export function getAddressWithCoords(coords) {
  if (!coords || !coords.lat || !coords.lon) {
    console.error('Wrong coordinates');
    return undefined;
  }
  return axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${coords.lat}+${coords.lon}&key=03c48dae07364cabb7f121d8c1519492&pretty=1`)
      .then(function (response) {
        const street = response.data.results[0].components.street ? response.data.results[0].components.street : response.data.results[0].components.road;
        const number = response.data.results[0].components.house_number ? response.data.results[0].components.house_number + ' ' : '';
        let city = undefined;

        if (response.data.results[0].components.city)
          city = response.data.results[0].components.city;
        else if (response.data.results[0].components.village)
          city = response.data.results[0].components.village
        else if (response.data.results[0].components.town)
          city = response.data.results[0].components.town;

        if (street === undefined || city === undefined)
          return undefined;

        return {address: number + street, city: city};
      })
      .catch(function (error) {
        console.log(error);
      })
}

export function getTimetable(openingHours) {
  const multipleDaysRegex = /([a-zA-Z]{2}-[a-zA-Z]{2}) ([0-9:\-, ]+)/;
  const simpleDayRegex = /([a-zA-Z]{2}) ([0-9:\-, ]+)/;
  const days = ["mo", "tu", "we", "th", "fr", "sa", "su"];
  let timetable = ["", "", "", "", "", "", ""];

  if (openingHours) {
    if (openingHours.indexOf("24/7") !== -1)
      for (let i = 0; i < 7; i++)
        timetable[i] = "00:00-24-00";
    else {
      let multipleDaysMatch = openingHours.match(multipleDaysRegex);
      let simpleDayMatch = openingHours.match(simpleDayRegex);

      while (multipleDaysMatch) {
        openingHours = openingHours.replace(multipleDaysMatch[0], "");
        for (let i = days.indexOf(multipleDaysMatch[1].slice(0, 2).toLowerCase()); i <= days.indexOf(multipleDaysMatch[1].slice(3,5).toLowerCase()); i++) {
          if (timetable[i] === "")
            timetable[i] = multipleDaysMatch[2];
          else
            timetable[i] = timetable[i] + ", " + multipleDaysMatch[2];
        }
        multipleDaysMatch = openingHours.match(multipleDaysRegex);
      }

      while (simpleDayMatch) {
        timetable[days.indexOf(simpleDayMatch[1].toLowerCase())] = simpleDayMatch[2];
        openingHours = openingHours.replace(simpleDayMatch[0], "");
        simpleDayMatch = openingHours.match(simpleDayRegex);
      }
    }
  }

  return timetable;
}
// Ph === public hollydays

// ##########################################################################
// ################### End Create OpenStreetMap Safeplace ###################
// ##########################################################################

// ####################################################
// ################### Fetch Market ###################
// ####################################################

export async function fetchMarket()
{
  const response = await fetch('https://data.strasbourg.eu/api/records/1.0/search/?dataset=marches_ems&q=&rows=200');
  const payload = await response.json();

  await updateOrCreateSafeplace(payload, "Market");
}

async function updateOrCreateSafeplace(payload, type)
{
  for (const item of payload.records) {
    const days = ["lundis", "mardis", "mercredis", "jeudis", "vendredis", "samedis", "dimanches"];
    let timetable = [];

    days.forEach((day, index) => {
      if (item.fields.jour.search(day) >= 0) {
          timetable.push(item.fields.horaire);
      } else
        timetable.push(null);
    })

    const doc = {
      safeplaceId: item.recordid,
      name: item.fields.nom_marche,
      description: "Ouvert " + item.fields.jour.toLowerCase() + " de " + item.fields.horaire,
      city: item.fields.commune,
      address: item.fields.adresse,
      coordinate: [item.fields.geo_point_2d[0].toString(), item.fields.geo_point_2d[1].toString()],
      dayTimetable: timetable,
      type: type
    };

    await Safeplace.updateOne({ safeplaceId: doc.safeplaceId }, doc, { upsert: true });
  }
}

// ########################################################
// ################### End Fetch Market ###################
// ########################################################

// ########################################################
// ################### Route calculation ##################
// ########################################################

export function getRouteRectangle(firstPoint, secondPoint) {
  let vector = getVector(firstPoint, secondPoint);
  let nx = getNx(vector, 0.0005);
  let ny = getNy(vector, nx);

  let rectangleFirst = addVectors([firstPoint.lat, firstPoint.lng], [nx, ny]);
  let rectangleSecond = addVectors([firstPoint.lat, firstPoint.lng], [-nx, -ny]);
  let rectangleThird = addVectors([secondPoint.lat, secondPoint.lng], [nx, ny]);
  let rectangleFourth = addVectors([secondPoint.lat, secondPoint.lng], [-nx, -ny]);

  return {1: rectangleFirst, 2: rectangleSecond, 3: rectangleThird, 4: rectangleFourth};
}

export function getRectangleExtremities(rectangle) {
  const rectangleValues = Object.values(rectangle);

  const lowestLongitude = Math.min(...rectangleValues.map(point => point[0]));
  const highestLongitude = Math.max(...rectangleValues.map(point => point[0]));
  const lowestLatitude = Math.min(...rectangleValues.map(point => point[1]));
  const highestLatitude = Math.max(...rectangleValues.map(point => point[1]));

  return {lowestLongitude, highestLongitude, lowestLatitude, highestLatitude};
}

function getVector(firstPoint, secondPoint) {
    return [secondPoint.lat - firstPoint.lat, secondPoint.lng - firstPoint.lng];
}

function getNx(vector, height) {
  let vectorSquare = Math.pow(vector[0] / vector[1], 2);
  return height / Math.sqrt(1 + vectorSquare);
}

function getNy(vector, nx) {
  const ny = (vector[0] / vector[1]) * nx;
  return ny * -1;
}

function addVectors(firstVector, secondVector) {
  return [firstVector[0] + secondVector[0], firstVector[1] + secondVector[1]];
}

function substractVectors(firstVector, secondVector) {
  return [firstVector[0] - secondVector[0], firstVector[1] - secondVector[1]];
}

function dot(firstVector, secondVector) {
  return firstVector[0] * secondVector[0] + firstVector[1] * secondVector[1];
}

export function filterItemsInMaxCoordinates(items, rectangleExtremities) {
  return items.filter(item => {
    return parseFloat(item.coordinate[0]) > rectangleExtremities.lowestLongitude &&
        parseFloat(item.coordinate[0]) < rectangleExtremities.highestLongitude &&
        parseFloat(item.coordinate[1]) > rectangleExtremities.lowestLatitude &&
        parseFloat(item.coordinate[1]) < rectangleExtremities.highestLatitude
  });
}

function isPointInRectangle(point, rectangle) {
  const pointCoordinates = [parseFloat(point.coordinate[0]), parseFloat(point.coordinate[1])];

  const vector1 = substractVectors(rectangle[1], rectangle[2]);
  const vector2 = substractVectors(rectangle[1], rectangle[3]);
  const vector3 = substractVectors(rectangle[1], pointCoordinates);

  const dotFirst = dot(vector3, vector1);
  const dotSecond = dot(vector1, vector1);
  const dotThird = dot(vector3, vector2);
  const dotFourth = dot(vector2, vector2);

  return 0 <= dotFirst && dotFirst <= dotSecond && 0 <= dotThird && dotThird <= dotFourth
}

function hasHours(timetable) {
    return timetable.filter(hours => hours !== '').length > 0;
}

function getMarketHours(time) {
    try {
    const regex = /(\d+)h(\d+)* à (\d+)h(\d+)*/;
    const matches = time.match(regex);
    const start = matches[2] ? parseInt(matches[1]) * 60 + parseInt(matches[2]) : parseInt(matches[1]) * 60;
    const end = matches[4] ?  parseInt(matches[3]) * 60 + parseInt(matches[4]) :  parseInt(matches[3]) * 60;
    return { start1: start , end1: end };
    } catch (error) {
        return null;
    }
}

function getSimpleHours(time) {
    try {
        const regex = /(\d+):(\d+)-(\d+):(\d+)/;
        const matches = time.match(regex);
        const start = parseInt(matches[1]) * 60 + parseInt(matches[2]);
        const end = parseInt(matches[3]) * 60 + parseInt(matches[4]);
        return { start1: start , end1: end };
    } catch (error) {
        return null;
    }
}

function getComplexHours(time) {
    try {
        const regex = /(\d+):(\d+)-(\d+):(\d+), (\d+):(\d+)-(\d+):(\d+)/;
        const matches = time.match(regex);
        const start1 = parseInt(matches[1]) * 60 + parseInt(matches[2]);
        const end1 = parseInt(matches[3]) * 60 + parseInt(matches[4]);
        const start2 = parseInt(matches[5]) * 60 + parseInt(matches[6]);
        const end2 = parseInt(matches[7]) * 60 + parseInt(matches[8]);
        return { start1, end1, start2, end2 };
    } catch (error) {
        return null;
    }
}

function getOpenedHours(time, type) {
    try {
    if (type === 'Market')
        return  getMarketHours(time);
    else if (time.includes(','))
        return getComplexHours(time);
    else
        return getSimpleHours(time);
    } catch (error) {
        return null;
    }
}

export function isOpen(safeplace) {
    const date = new Date();
    const time = date.getMinutes() + date.getHours() * 60;
    let day = date.getDay() - 1;

    if (day < 0)
        day = 6;

    if (hasHours(safeplace.dayTimetable)) {
        const openedHours = getOpenedHours(safeplace.dayTimetable[day], safeplace.type);

        if (!openedHours)
            return false;
        if (openedHours === '') {
            return false;
        } else {
            if (openedHours.start2 && openedHours.end2)
                return (time >= openedHours.start1 && time <= openedHours.end1) || (time >= openedHours.start2 && time <= openedHours.end2);
            else
                return time >= openedHours.start1 && time <= openedHours.end1;
        }
    }
    return true;
}

export function isBusy(busyArea) {
  const date = new Date();
  const hour = date.getHours();
  let day = date.getDay();
  const thursday = 4;

  if (!busyArea.schedule.hasOwnProperty(day) || !busyArea.schedule[day].hasOwnProperty(hour)) {
    if (busyArea.schedule.hasOwnProperty(thursday) && busyArea.schedule[thursday].hasOwnProperty(hour))
      return busyArea.schedule[thursday][hour] > 10;
    else
      return false;
  }
  return busyArea.schedule[day][hour] > 10;
}

export function getNumberOfObjectsInRectangle(objects, rectangle, type) {
    let numberOfObjects = 0;

    for (const object of objects)
        if (isPointInRectangle(object, rectangle)) {
            if (type === "safeplace" && isOpen(object))
                numberOfObjects++;
            else if (type === "busyArea" && isBusy(object))
                numberOfObjects++;
        }
    return numberOfObjects;
}

// ########################################################
// ################### End Route calculation ##############
// ########################################################

export function getActualScore(actual, filteredAnomalies) {
  let actualScore = actual.actualNumberOfLights + (actual.actualNumberOfSafeplaces * 5) + (actual.actualNumberOfBusyAreas * 7);

  for (const anomaly of filteredAnomalies) {
    if (anomaly.type === 'Dead End')
      return 0;
    else
      actualScore -= 2;
  }
  return actualScore;
}