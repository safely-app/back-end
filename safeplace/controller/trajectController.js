import express from "express";
import fetch from 'node-fetch';
import { validateTraject, validateOldTraject } from "../store/validation"
import {requestAuth} from "../store/middleware";
import { Safeplace } from "../database/models/";
import {orderByDistance} from "geolib";
import {calculateMetersWithCoordinates, filterTooFarSafeplaces, getMaxMetersOfTrajects, checkAnomalies, getRouteRectangle, isPointInRectangle} from "../store/utils";

export const TrajectController = express.Router();


//actual traject calculation
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

//new traject calculation
TrajectController.post('/v2',requestAuth, async (req, res) => {
    if (req.authResponse.role === 'empty')
        return res.status(401).json({message: "Unauthorized"});

    const { error } = validateTraject(req.body);

    if (error)
        return res.status(400).json({ error: error.details[0].message});

    const safeplacesCoordinates = await filterTooFarSafeplaces(req.body.routes[0].legs[0].start_location, await getMaxMetersOfTrajects(req.body.routes), await Safeplace.find());
    let anomalies = await fetch('https://api.safely-app.fr/support/anomaly/validated', {method: 'GET', headers: {'Authorization': req.headers.authorization}})
    let numberOfSafeplaces = 0;
    let numberOfAnomalies = 0;
    let bestTraject = 0

    if (anomalies.status === 401)
        return res.status(401).json({message: "Unauthorized"});
    else if (anomalies.status === 500)
        return res.status(500).json({message: "Internal server error"});
    else
        anomalies = await anomalies.json();

    for (let i = 0; req.body.routes[i]; i++) {
        let actualNumberOfSafeplaces = 0;
        let actualNumberOfAnomalies = 0;
        for (let step of req.body.routes[i].legs[0].steps) {
            const closest = orderByDistance(step.start_location, safeplacesCoordinates);

            actualNumberOfAnomalies += await checkAnomalies(step, anomalies);

            for (let close of closest) {
                const meters = await calculateMetersWithCoordinates(step.start_location, close);
                if (meters > 50) {
                    if (actualNumberOfSafeplaces - (actualNumberOfAnomalies * 2) > numberOfSafeplaces) {
                        numberOfSafeplaces = actualNumberOfSafeplaces;
                        numberOfAnomalies = actualNumberOfAnomalies;
                        bestTraject = i;
                    }
                    break
                }
                actualNumberOfSafeplaces++;
            }
        }
    }

    res.status(200).json({index : bestTraject, number_of_safeplaces: numberOfSafeplaces, number_of_anomalies: numberOfAnomalies});
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

TrajectController.post('/last', requestAuth, async => {
    if (req.authResponse.role === 'empty')
    return res.status(401).json({message: "Unauthorized"});

    const { error } = validateTraject(req.body);

    if (error)
        return res.status(400).json({ error: error.details[0].message});

    let numberOfSafeplaces = 0;
    let numberOfAnomalies = 0; // ADD anomalies in calculus
    let bestTraject = 0;
    const safeplaces = Safeplace.find();


    for (let i = 0; req.body.routes[i]; i++) {
        let actualNumberOfSafeplaces = 0;
        let actualNumberOfAnomalies = 0;
        for (let step of req.body.routes[i].legs[0].steps) {
            const rectangle = getRouteRectangle(lat, lng); // give begin an end of leg
            const rectangleExtemities = getRectangleExtemities(rectangle); 
            const filteredSafeplaces = safeplaces.filter((o) => {
                o.coordinate[0] > rectangleExtemities.lowestLongitude &&
                o.coordinate[0] < rectangleExtemities.highestLongitude &&
                o.coordinate[1] > rectangleExtemities.lowestLatitude &&
                o.coordinate[1] < rectangleExtemities.highestLatitude
            });

            console.log(filteredSafeplaces);
            for (const safeplace of filteredSafeplaces) {
                if (isPointInRectangle(safeplace, rectangle))
                    actualNumberOfSafeplaces++;
            }
        }

        if (actualNumberOfSafeplaces > numberOfSafeplaces) {
            numberOfSafeplaces = actualNumberOfSafeplaces;
            bestTraject = i;
        }
    }
    res.status(200).json({ index : bestTraject, number_of_safeplaces: numberOfSafeplaces });
})