import express from 'express';
import _ from "lodash";
import { Campaign } from '../database/models';
import { CampaignUserCheck, needToBeAdmin, needToBeLogin } from '../store/middleware';
import { validateCampaign, putValidateCampaign } from '../store/validation';

export const CampaignController = express.Router();

CampaignController.get('/', needToBeAdmin , async (req, res) => {
    Campaign.find({}, function(err, targets) {
        let campaignsMap = [];

        targets.forEach((target) => {

            let PickedCampaign = _.pick(target, [
            '_id', 'ownerId','name','budget', 'status', 'startingDate']);
            PickedCampaign.targets = target.targets;
            campaignsMap.push(PickedCampaign);
        });
        res.status(200).send(campaignsMap);
    });
});

CampaignController.get('/:id', CampaignUserCheck, async (req, res) => {
    let campaign = await Campaign.findOne({ _id: req.params.id });

    if (campaign) {
        const PickedCampaign = _.pick(campaign,
            ['_id', 'ownerId','name','budget', 'status', 'startingDate']);
    
        res.send(PickedCampaign);
    } else
        res.status(404).json({error: "Campaign not found"});
});

CampaignController.put('/:id', CampaignUserCheck, async (req, res, next) => {
    const { error } = putValidateCampaign(req.body);

    if (error)
      return res.status(400).json({ error: error.details[0].message});
    const newBody = req.body;

    if (newBody._id)
        delete newBody._id   

    Campaign.findByIdAndUpdate(req.params.id, newBody, (err) => {
        if (err)
            return res.status(403).json({error: 'Update couldn\'t be proceed'})
        return res.status(200).json({success: 'Updated!'})
    })
});

CampaignController.copy('/:id', CampaignUserCheck, async (req, res) => {
    let campaign = await Campaign.findOne({ _id: req.params.id });
    let new_campaign = new Campaign(_.pick(campaign,
        ['ownerId','name','budget', 'status', 'startingDate']));
        
    new_campaign.targets = campaign.targets;
    new_campaign.name = new_campaign.name += " (copy)";
    await new_campaign.save();
    return res.status(200).json({success: 'Duplicated!'})
});

CampaignController.post('/', needToBeLogin, async (req, res) => {
    const { error } = validateCampaign(req.body);

    if (error)
      return res.status(400).json({ error: error.details[0].message});
    let campaign = new Campaign(_.pick(req.body, [
        'ownerId','name','budget', 'status', 'startingDate']));
    campaign.targets = req.body.targets;
    await campaign.save();
    res.status(201).send(campaign);
});

CampaignController.delete('/:id', CampaignUserCheck, async (req, res) => {
    Campaign.deleteOne({_id: req.params.id})
      .then(()=> {
        res.status(200).json({ message: 'Campaign deleted !' });
      })
      .catch( (error) => {
        res.status(400).json({ error: error });
      });
});