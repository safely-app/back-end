import express from 'express';
import fetch from 'node-fetch';
import https from 'https';
import fs from 'fs';
import pbf2json from 'pbf2json';
import through from 'through2';
import { Safeplace } from "../database/models/";
import { orderByDistance } from "geolib";

import { validateSafeplaceCreation } from "../store/validation";
import {getAddressWithCoords, getTimetable} from "../store/utils";
import {requestAuth} from "../store/middleware";

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

//TODO verify req.body.coord with JOI
SafeplaceController.post('/nearest', requestAuth, async (req, res) => {
  if (req.authResponse.role === 'empty')
    return res.status(401).json({message: "Unauthorized"})

  const safeplaces = await Safeplace.find();
  const coordinates = safeplaces.map((a) => {
    return {latitude: a.coordinate[0], longitude: a.coordinate[1]};
  });
  const closest = orderByDistance(req.body.coord, coordinates);

  //TODO pour l'instant vol d'oiseau mais changer avec une api pour réel

  res.status(200).json({nearest: closest[0]});
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
  }

  Object.keys(doc).forEach(key => doc[key] === undefined ? delete doc[key] : {});

  if (doc.city === undefined || doc.name === undefined) {
    console.error("Safeplace invalid");
    return;
  }

  // console.log(doc.coordinate);
  Safeplace.findOne({ address: doc.address })
    .then(async (found) => {
      if (found)
        console.error("This safeplace already exist");
      else {
        const created = await Safeplace.create(doc);

        if (created)
          console.log("Safeplace created");
        else
          console.error("An error occured");
      }
    })

}

// TODO verify the content of body with Joi
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