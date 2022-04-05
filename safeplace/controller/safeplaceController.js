import express from 'express';
import https from 'https';
import fs from 'fs';
import pbf2json from 'pbf2json';
import through from 'through2';
import {Safeplace} from "../database/models/";
import { orderByDistance } from "geolib";

import {validateNearest, validateSafeplaceCreation, validateSafeplaceUpdateHours} from "../store/validation";
import {cutAfterRadius, createOpenStreetMapSafeplace} from "../store/utils";
import {requestAuth} from "../store/middleware";
import axios from "axios";
import {config} from "../store/config";

export const SafeplaceController = express.Router();

// ##################################################
// ################### Basic CRUD ###################
// ##################################################

SafeplaceController.get('/', requestAuth, async (req, res) => {
  const safeplaces = await Safeplace.find({});

  if (req.authResponse.role === 'empty')
    return res.status(401).json({message: "Unauthorized"})
  if (safeplaces) {
    if (!isNaN(req.query.limit) && !isNaN(req.query.offset))
      res.status(200).json(safeplaces.splice(req.query.offset).slice(0, req.query.limit))
    else
      res.status(200).json(safeplaces);
  } else
    res.status(500).json({message: "No safeplaces found"});
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
    description: req.body.description,
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
    description: req.body.description,
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

// ######################################################
// ################### Nearest ##########################
// ######################################################

SafeplaceController.post('/nearest', requestAuth, async (req, res) => {
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

// ########################################################
// ################### OpenStreetMap ######################
// ########################################################

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

// ############################################################
// ################### Verify hours shop ######################
// ############################################################

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
