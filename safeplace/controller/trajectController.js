import express from "express";
import { validateTraject, validateOldTraject } from "../store/validation"
import { Safeplace } from "../database/models/";
import {orderByDistance} from "geolib";
import {calculateMetersWithCoordinates, filterTooFarSafeplaces, getMaxMetersOfTrajects} from "../store/utils";

export const TrajectController = express.Router();

TrajectController.post('/', async (req, res) => {
    const { error } = validateTraject(req.body);

    if (error)
        return res.status(400).json({ error: error.details[0].message});

    let numberOfSafeplaces = 0;
    let bestTraject = 0
    const safeplaces = await Safeplace.find();
    const safeplacesCoordinates = await filterTooFarSafeplaces(req.body.routes[0].legs[0].start_location, await getMaxMetersOfTrajects(req.body.routes), safeplaces);

    for (let i = 0; req.body.routes[i]; i++) {
        let actualNumberOfSafeplaces = 0;
        for (let step of req.body.routes[i].legs[0].steps) {
            const closest = orderByDistance(step.start_location, safeplacesCoordinates);

            for (let close of closest) {
                const meters = await calculateMetersWithCoordinates(step.start_location, close);
                if (meters > 50) {
                    if (actualNumberOfSafeplaces > numberOfSafeplaces) {
                        numberOfSafeplaces = actualNumberOfSafeplaces;
                        bestTraject = i;
                    }
                    break
                }
                actualNumberOfSafeplaces++;
            }
        }
    }

    req.body.safest = {index : bestTraject, number_of_safeplaces: numberOfSafeplaces};
    res.status(200).json(req.body);
})

TrajectController.post('/old', async (req, res) => {
    const { error } = validateOldTraject(req.body);

    if (error)
        return res.status(400).json({ error: error.details[0].message});

    let waypoints = [];
    const safeplaces = await Safeplace.find();
    const safeplacesCoordinates = safeplaces.map((safeplace) => {
        return {latitude: safeplace.coordinate[0], longitude: safeplace.coordinate[1]};
    });

    for (const index in req.body.coordinates) {
        const closest = orderByDistance(req.body.coordinates[index], safeplacesCoordinates);

        const meters = await calculateMetersWithCoordinates(req.body.coordinates[index], closest[0])

        if (meters <= 100) {
            const obj = await waypoints.find(o => o.latitude === closest[0].latitude && o.longitude === closest[0].longitude)
            
            if (!obj)
                waypoints.push(closest[0]);
        }
    }

    res.status(200).json(waypoints);
})
