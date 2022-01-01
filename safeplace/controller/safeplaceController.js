import express, {response} from 'express';
import fetch from 'node-fetch';
import https from 'https';
import fs from 'fs';
import pbf2json from 'pbf2json';
import through from 'through2';
import { Safeplace } from "../database/models/";
import { orderByDistance } from "geolib";

import {validateNearest, validateSafeplaceCreation, validateSafeplaceUpdateHours} from "../store/validation";
import {getAddressWithCoords, getTimetable, cutAfterRadius, calculateMetersWithCoordinates} from "../store/utils";
import {requestAuth} from "../store/middleware";
import axios from "axios";
import {config} from "../store/config";

export const SafeplaceController = express.Router();

SafeplaceController.get('/', requestAuth, async (req, res) => {
  const safeplaces = await Safeplace.find({});

  if (req.authResponse.role === 'empty')
    return res.status(401).json({message: "Unauthorized"})
  if (safeplaces)
    res.status(200).json(safeplaces);
  else
    res.status(500).json({message: "No safeplaces found"});
})

SafeplaceController.post('/nearest', async (req, res) => {
  // if (req.authResponse.role === 'empty')
  //   return res.status(401).json({message: "Unauthorized"})

  const { error } = validateNearest(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message});
  }

  const safeplaces = await Safeplace.find();
  const coordinates = safeplaces.map((a) => {
    return {latitude: a.coordinate[0], longitude: a.coordinate[1]};
  });
  const closest = orderByDistance(req.body.coord, coordinates);

  let nearest = undefined
  let nearest_duration = undefined
  let index = 0;
  while (index < 3) {
    const response = await axios
        .get(`https://maps.googleapis.com/maps/api/directions/json?origin=${req.body.coord.latitude},${req.body.coord.longitude}&destination=${closest[index].latitude},${closest[index].longitude}&key=${config.prod.GOOGLE_API_KEY}&mode=walking&language=fr`
            , {headers: {"Content-type": "application/json"}});

    const duration = parseInt(response.data.routes[0].legs[0].duration.text.split(' ')[0]);
    if (nearest === undefined || nearest_duration > duration) {
      nearest = closest[index]
      nearest_duration = duration
    }
    index++;
  }
  const real_nearest = await safeplaces.find(o => o.coordinate[0] === nearest.latitude && o.coordinate[1] === nearest.longitude)

  res.status(200).json({nearest: real_nearest});
})

SafeplaceController.post('/birdNearest/:number', requestAuth, async (req, res) => {
  if (req.authResponse.role === 'empty')
    return res.status(401).json({message: "Unauthorized"})

  const { error } = validateNearest(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message});
  }

  const safeplaces = await Safeplace.find();
  const coordinates = safeplaces.map((a) => {
    return {latitude: a.coordinate[0], longitude: a.coordinate[1]};
  });
  const closest = orderByDistance(req.body.coord, coordinates).slice(0, req.params.number);
  let final_closest = []

  for (const close in closest) {
    const found = await safeplaces.find(o => o.coordinate[0] === closest[close].latitude && o.coordinate[1] === closest[close].longitude)
    final_closest.push(found)
  }

  res.status(200).json({nearest: final_closest});
})

SafeplaceController.post('/nearestRadius/:distance', requestAuth, async (req, res) => {
  if (req.authResponse.role === 'empty')
    return res.status(401).json({message: "Unauthorized"})

  const { error } = validateNearest(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message});
  }

  const safeplaces = await Safeplace.find();
  const coordinates = safeplaces.map((a) => {
    return {latitude: a.coordinate[0], longitude: a.coordinate[1]};
  });
  let closest = orderByDistance(req.body.coord, coordinates).slice(0, req.params.number);
  closest = await cutAfterRadius(req.body.coord, closest, req.params.distance);
  let final_closest = []

  for (const close in closest) {
    const found = await safeplaces.find(o => o.coordinate[0] === closest[close].latitude && o.coordinate[1] === closest[close].longitude)
    final_closest.push(found)
  }

  res.status(200).json({nearest: final_closest});
})

SafeplaceController.get('/:id', requestAuth, async (req, res) => {
  if (req.authResponse.role === 'empty')
    return res.status(401).json({message: "Unauthorized"})

  const safeplace = await Safeplace.findOne({ _id: req.params.id});

  if (safeplace)
    res.status(200).json(safeplace);
  else
    res.status(500).json({message: "This safeplace doesn't exist"});
})

SafeplaceController.get('/ownerSafeplace/:ownerId', requestAuth, async (req, res) => {
  if (req.authResponse.role === 'empty')
    return res.status(401).json({message: "Unauthorized"})

  const safeplace = await Safeplace.findOne({ ownerId: req.params.ownerId});

  if (safeplace)
    res.status(200).json(safeplace);
  else
    res.status(500).json({message: "No safeplace found for this owner"});
})

SafeplaceController.post('/openStreetMap', async (req, res) => {

  const url = 'https://download.openstreetmap.fr/extracts/europe/france/alsace/bas_rhin-latest.osm.pbf';
  const path = 'assets/openStreetMap.pbf';

  const request = https.get(url, function(response) {
    if (response.statusCode === 200) {
      const file = fs.createWriteStream(path);
      response.pipe(file);
      file.on("finish", function () {
        const config = {
          file: './' + path,
          tags: [
            'shop'
          ],
          leveldb: '/tmp'
        };

        pbf2json.createReadStream( config )
          .pipe( through.obj( function( item, e, next ){
            createOpenStreetMapSafeplace( item );
            next();
          }));
        res.status(200).json({message: 'ok'});
      })
    }
    request.setTimeout(60000, function() {
      request.abort();
    });
  });
})

async function createOpenStreetMapSafeplace(safeplace) {
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

SafeplaceController.post('/', requestAuth, async (req, res) => {
  if (req.authResponse.role !== 'admin')
    return res.status(401).json({message: "Unauthorized"})

  const { error } = validateSafeplaceCreation(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message});
  }

  const safeplace = {
    safeplaceId: req.body.safeplaceId,
    ownerId: req.body.ownerId,
    name: req.body.name,
    decription: req.body.decription,
    city: req.body.city,
    address: req.body.address,
    coordinate: req.body.coordinate,
    dayTimetable: req.body.dayTimetable,
    grade: req.body.grade,
    type: req.body.type,
    };

  Object.keys(safeplace).forEach(key => safeplace[key] === undefined ? delete safeplace[key] : {});

  Safeplace.findOne({ address: safeplace.address })
    .then(async (found) => {
      if (found)
        res.status(403).json({message: "This safeplace already exist"})
      else {
        const created = await Safeplace.create(safeplace);

        if (created)
          res.status(200).json({message: "Safeplace created"});
        else
          res.status(500).json({message: "An error occured"});
      }
    })
})

SafeplaceController.put('/:id', requestAuth, async (req, res) => {
  if (req.authResponse.role !== 'admin')
    return res.status(401).json({message: "Unauthorized"})

  const doc = {
    safeplaceId: req.body.safeplaceId,
    ownerId: req.body.ownerId,
    name: req.body.name,
    decription: req.body.decription,
    city: req.body.city,
    address: req.body.address,
    coordinate: req.body.coordinate,
    dayTimetable: req.body.dayTimetable,
    grade: req.body.grade,
    type: req.body.type,
    email: req.body.email,
    phone: req.body.phone,
    web: req.body.web
  };

  Object.keys(doc).forEach(key => doc[key] === undefined ? delete doc[key] : {});

  Safeplace.findByIdAndUpdate(req.params.id, doc, (err) => {
    if (err)
      return res.status(403).json({error: 'Update couldn\'t be proceed'})
    return res.status(200).json({success: 'Updated!'})
  })
})

SafeplaceController.delete('/:id', requestAuth, async (req, res) => {
  if (req.authResponse.role !== 'admin')
    return res.status(401).json({message: "Unauthorized"})

  Safeplace.deleteOne({_id: req.params.id})
    .then(()=> {
      res.status(200).json({ message: 'Safeplace deleted !' });
    })
    .catch( (error) => {
      res.status(400).json({ error: error });
    });
})

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

SafeplaceController.get("/getHours/:safeplaceId", async (req, res) => {
  if (req.params.safeplaceId.length !== 24)
    return res.status(400).json({ "Error": "safeplaceId should be 24 characters long" });
  const safeplace = await Safeplace.findOne({ _id: req.params.safeplaceId});

  if (safeplace)
    res.status(200).json({ 'dayTimetable': safeplace.dayTimetable});
  else
    res.status(400).json({ "message": "Safeplace not found" });
})

SafeplaceController.put("/modifyHours/:safeplaceId", async (req, res) => {
  if (req.params.safeplaceId.length !== 24)
    return res.status(400).json({ "Error": "safeplaceId should be 24 characters long" });

  const { error } = validateSafeplaceUpdateHours(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message});
  }

  const updated = await Safeplace.findOneAndUpdate({ _id: req.params.safeplaceId }, {dayTimetable: req.body.dayTimetable});
  if (updated)
    res.status(200).send('Updated');
  else
    res.status(400).json({message: "Could not update or safeplace not found"})
})
