import axios from "axios";
import nodemailer from "nodemailer";

import { config } from "./config";

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
  const latA = coordinateA.latitude * (Math.PI / 180);
  const latB = coordinateB.latitude * (Math.PI / 180);
  const lonA = coordinateA.longitude * (Math.PI / 180);
  const lonB = coordinateB.longitude * (Math.PI / 180);

  const result = 6372795.477598 * Math.acos(Math.sin(latA) * Math.sin(latB) + Math.cos(latA) * Math.cos(latB) * Math.cos(lonA - lonB));

  return Math.round(result);
}

// Ph === public hollydays 