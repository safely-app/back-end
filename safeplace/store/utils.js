import axios from "axios";

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