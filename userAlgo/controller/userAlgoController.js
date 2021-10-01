import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs';
import _ from "lodash";

import { ValidateAlgoPost } from '../store/validation';

export const userAlgoController = express.Router();

userAlgoController.post('/', async (req, res) => {
    const { error } = ValidateAlgoPost(req.body);

    if (error)
      return res.status(400).json({ error: error.details[0].message});
    
      try {
        const targetList = await fetch('https://api.safely-app.fr/commercial/target/', {method: 'GET', headers: {'Authorization': req.headers.authorization}})
            .then(response => response.json())

        let target;

        for (let i = 0; i < targetList.length; i++) {
            if (targetList[i]._id === req.body.targetId) {
                target = targetList[i];
                break;
            }
        }
        
        const userFile = JSON.parse(fs.readFileSync("./store/listusers.json"));
        const ages = target.ageRange.split('-');
        let userList = []

        for (let i = 0; i < userFile.length; i++) {
            if (userFile[i].age >= parseInt(ages[0]) && userFile[i].age <= parseInt(ages[1]) && userFile[i].csp === target.csp)
                userList.push(userFile[i]);
        }
        res.status(201).send(userList);
    } catch (error) {
        res.status(403).send(error);
}
});