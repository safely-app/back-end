import express from "express";
import { validateTraject } from "../store/validation"
import { Safeplace } from "../database/models/";
import {orderByDistance} from "geolib";
import {calculateMetersWithCoordinates} from "../store/utils";

export const TrajectController = express.Router();

TrajectController.post('/', async (req, res) => {
    const { error } = validateTraject(req.body);

    if (error)
        return res.status(400).json({ error: error.details[0].message});

    let waypoints = [];
    const safeplaces = await Safeplace.find();
    const safeplacesCoordinates = safeplaces.map((a) => {
        return {latitude: a.coordinate[0], longitude: a.coordinate[1]};
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