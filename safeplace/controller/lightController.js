import express from 'express';
import axios from 'axios';
import _ from "lodash";

import { Light } from "../database/models";
import { requestAuth, AdminOnly } from '../store/middleware';

export const LightController = express.Router();

LightController.post("/DataFetch", requestAuth, AdminOnly, async (req, res) => {
    const response = await axios
        .get(`https://data.mulhouse-alsace.fr/api/records/1.0/search/?dataset=68224_points-lumineux_mulhouse&rows=-1`
            , {headers: {"Content-type": "application/json"}});

    let LightGeoPoints = [];
    let excludedStreets = ["PORTUGAL", "KASTLER", "SEGUIN", "MAIRE", "CURIE", "ALGER", "BOURSE", "WYLER"];

    for (const record of response.data.records) {
        if (record.fields.support !== "Console Style" && record.fields.puissance >= 35 && !excludedStreets.includes(record.fields.mnemo_rue)) {
            var Data = {"coordinate": [], "type": "", "power": "", "street": ""};

            Data.street = record.fields.mnemo_rue;
            Data.coordinate = record.fields.geo_point_2d;
            Data.type = record.fields.alimentati;
            Data.power = record.fields.puissance;

            let request = new Light(_.pick(Data, ['coordinate', 'type', 'power', 'street']));
    
            await request.save();
            LightGeoPoints.push(Data);
        }
    }
    return res.status(200).json(LightGeoPoints); 
})

LightController.get("/", requestAuth, AdminOnly, async (req, res) => {
    Light.find({}, function(err, requests) {
        res.status(200).send(requests);
    });
})
