import express from 'express';
import _ from "lodash";
import { Advertising } from '../database/models';
import { AdvertisingUserCheck, AdvertisingOwnerCheck, AdvertisingCampaignCheck, needToBeAdmin, needToBeLogin } from '../store/middleware';
import { validateAdvertising, putValidateAdvertising } from '../store/validation';

export const AdvertisingController = express.Router();

AdvertisingController.get('/', needToBeAdmin , async (req, res) => {
    Advertising.find({}, function(err, targets) {
        let advertisingsMap = [];

        targets.forEach((target) => {

            let PickedAdvertising = _.pick(target, [
                '_id', 'ownerId', 'campaignId', 'title','description', 'imageUrl', 'targetType']);
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
            '_id', 'ownerId', 'campaignId', 'title','description', 'imageUrl', 'targetType']);

        res.send(PickedAdvertising);
    } else
        res.status(404).json({error: "Advertising not found"});
});

AdvertisingController.get('/owner/:id', AdvertisingOwnerCheck , async (req, res) => {
    let advertising = await Advertising.findOne({ ownerId: req.params.id });

    if (advertising) {
        const PickedAdvertising = _.pick(advertising, [
            '_id', 'ownerId', 'campaignId', 'title','description', 'imageUrl', 'targetType']);

        res.send(PickedAdvertising);
    } else
        res.status(404).json({error: "Advertising not found"});
});

AdvertisingController.get('/campaign/:id', AdvertisingCampaignCheck , async (req, res) => {
    Advertising.find({ campaignId: req.params.id }, function(err, advertisings) {
        let advertisingsMap = [];

        if (err) {
            return res.status(500).send({
                error: 'Error: Advertising can\'t be found'
            });
        }

        for (const advertising of advertisings) {
            const PickedAdvertising = _.pick(advertising, [
                '_id', 'ownerId', 'campaignId', 'title','description', 'imageUrl', 'targetType']);

            advertisingsMap.push({
                ...PickedAdvertising,
                targets: advertising.targets
            });
        }

        return res.status(200).send(advertisingsMap);
    });
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
        'ownerId', 'campaignId', 'title','description', 'imageUrl', 'targetType']));
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