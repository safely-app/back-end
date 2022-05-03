import express from 'express';
import _ from "lodash";
import { Modif } from '../database/models';
import { ModifUserCheck, ModifOwnerCheck, needToBeAdmin, needToBeLogin } from '../store/middleware';
import { validateModif, putValidateModif } from '../store/validation';

export const ModifController = express.Router();

ModifController.get('/', needToBeAdmin , async (req, res) => {
    Modif.find({}, function(err, targets) {
        let modifMap = [];

        targets.forEach((target) => {

            let PickedModif = _.pick(target, [
            "_id", "safeplaceId", "ownerId", "name", "description", "city", "address", "coordinate", "dayTimetable", "grade", "type", "email", "phone", "web"]);
            PickedModif.targets = target.targets;
            modifMap.push(PickedModif);
        });
        res.status(200).send(modifMap);
    });
});

ModifController.get('/:id', ModifUserCheck, async (req, res) => {
    let modif = await Modif.findOne({ _id: req.params.id });

    if (modif) {
        const PickedModif = _.pick(modif, [
            "_id", "safeplaceId", "ownerId", "name", "description", "city", "address", "coordinate", "dayTimetable", "grade", "type", "email", "phone", "web"]);
    
        res.send(PickedModif);
    } else
        res.status(404).json({error: "Modif not found"});
});

ModifController.put('/:id', ModifUserCheck, async (req, res) => {
    const { error } = putValidateModif(req.body);

    if (error)
      return res.status(400).json({ error: error.details[0].message});
    const newBody = req.body;

    if (newBody._id)
        delete newBody._id   

    Modif.findByIdAndUpdate(req.params.id, newBody, (err) => {
        if (err)
            return res.status(403).json({error: 'Update couldn\'t be proceed'})
        return res.status(200).json({success: 'Updated!'})
    })
});

ModifController.post('/', needToBeLogin, async (req, res) => { // Check si la personne est en possession du safeplace ou s'il est admin
    const { error } = validateModif(req.body);

    if (error)
      return res.status(400).json({ error: error.details[0].message});
    let modif = new Modif(_.pick(req.body, [
        "safeplaceId", "ownerId", "name", "description", "city", "address", "coordinate", "dayTimetable", "grade", "type", "email", "phone", "web"]));
    await modif.save();
    res.status(201).send(modif);
});

ModifController.delete('/:id', ModifUserCheck, async (req, res) => {
    Modif.deleteOne({_id: req.params.id})
      .then(()=> {
        res.status(200).json({ message: 'Modif deleted !' });
      })
      .catch( (error) => {
        res.status(400).json({ error: error });
      });
});