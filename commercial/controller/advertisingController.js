import express from 'express';
import _ from "lodash";
import { Advertising } from '../database/models';
import { AdvertisingUserCheck, AdvertisingOwnerCheck, needToBeAdmin, needToBeLogin } from '../store/middleware';
import { validateAdvertising, putValidateAdvertising } from '../store/validation';

export const AdvertisingController = express.Router();

AdvertisingController.get('/', needToBeAdmin , async (req, res) => {
    Advertising.find({}, function(err, targets) {
        let advertisingsMap = [];

        targets.forEach((target) => {

            let PickedAdvertising = _.pick(target, [
            '_id', 'ownerId','title','description', 'imageUrl', 'targetType']);
            PickedAdvertising.targets = target.targets;
            advertisingsMap.push(PickedAdvertising);
        });
        res.status(200).send(advertisingsMap);
    });
});

AdvertisingController.get('/:id', AdvertisingUserCheck, async (req, res) => {
    let advertising = await Advertising.findOne({ _id: req.params.id });

    if (advertising) {
        const PickedAdvertising = _.pick(advertising, [
            '_id', 'ownerId','title','description', 'imageUrl', 'targetType']);
    
        res.send(PickedAdvertising);
    } else
        res.status(404).json({error: "Advertising not found"});
});

AdvertisingController.get('/owner/:ownerId', AdvertisingUserCheck , async (req, res) => {
    let advertising = await Advertising.findOne({ ownerId: req.params.ownerId });

    if (advertising) {
        const PickedAdvertising = _.pick(advertising, [
            '_id', 'ownerId','title','description', 'imageUrl', 'targetType']);
    
        res.send(PickedAdvertising);
    } else
        res.status(404).json({error: "Advertising not found"});
});

AdvertisingController.put('/:id', AdvertisingUserCheck, async (req, res) => {
    const { error } = putValidateAdvertising(req.body);

    if (error)
      return res.status(400).json({ error: error.details[0].message});
    const newBody = req.body;

    if (newBody._id)
        delete newBody._id   

    Advertising.findByIdAndUpdate(req.params.id, newBody, (err) => {
        if (err)
            return res.status(403).json({error: 'Update couldn\'t be proceed'})
        return res.status(200).json({success: 'Updated!'})
    })
});

AdvertisingController.post('/', needToBeLogin, async (req, res) => {
    const { error } = validateAdvertising(req.body);

    if (error)
      return res.status(400).json({ error: error.details[0].message});
    let advertising = new Advertising(_.pick(req.body, [
        'ownerId','title','description', 'imageUrl', 'targetType']));
    await advertising.save();
    res.status(201).send(advertising);
});

AdvertisingController.delete('/:id', AdvertisingUserCheck, async (req, res) => {
    Advertising.deleteOne({_id: req.params.id})
      .then(()=> {
        res.status(200).json({ message: 'Advertising deleted !' });
      })
      .catch( (error) => {
        res.status(400).json({ error: error });
      });
});