import axios from "axios";
import nodemailer from "nodemailer";

import { config } from "./config";
import {Safeplace} from "../database/models";
import fetch from 'node-fetch';
import {orderByDistance} from "geolib";
import {func} from "joi";

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

export async function checkAnomalies(step, anomalies) {
  let splitinstructions = step.html_instructions.split("<b>");
  splitinstructions = splitinstructions[splitinstructions.length - 1].split("</b>")[0];
  splitinstructions = await makeVerboseStreet(splitinstructions);

  let obj = anomalies.find(o => o.street.split(",")[0].toLowerCase().replace(/[0-9]* /, "") === splitinstructions.toLowerCase());
  if (obj)
    return 1;
  else
    return 0;
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
      if (item.fields.jour.search(day) >= 0)
        timetable.push(item.fields.horaire);
      else
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