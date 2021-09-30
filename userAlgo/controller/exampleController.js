import express from 'express';
import _ from "lodash";
import { ExampleTarget } from '../database/models';
import { validateExampleTarget } from '../store/validation';
import { ExampleTargetUserCheck } from '../store/middleware';

export const ExampleTargetController = express.Router();

ExampleTargetController.post('/', async (req, res) => {
    const { error } = validateExampleTarget(req.body);

    if (error)
      return res.status(400).json({ error: error.details[0].message});
    let ExampleTarget = new ExampleTarget(_.pick(req.body, [
        'ownerId','name','csp', 'ageRange']));

    ExampleTarget.interests = req.body.interests;
    await ExampleTarget.save();
    res.status(201).send(ExampleTarget);
});

ExampleTargetController.get('/', async (req, res) => {
    ExampleTarget.find({}, function(err, targets) {
        let targetsMap = [];

        targets.forEach((target) => {

            let PickedExampleTarget = _.pick(target, [
            '_id', 'ownerId', 'name', 'csp', 'ageRange']);
            PickedExampleTarget.interests = target.interests;
            targetsMap.push(PickedExampleTarget);
        });
        res.status(200).send(targetsMap);
    });
});

ExampleTargetController.put('/:id', ExampleTargetUserCheck, async (req, res, next) => {

    ExampleTarget.findByIdAndUpdate(req.params.id, newBody, (err) => {
        if (err)
            return res.status(403).json({error: 'Update couldn\'t be proceed'})
        return res.status(200).json({success: 'Updated!'})
    })
});