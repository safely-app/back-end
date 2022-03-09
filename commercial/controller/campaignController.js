import express from 'express';
import _ from "lodash";
import { Campaign, MarketingTarget } from '../database/models';
import { CampaignUserCheck, needToBeAdmin, needToBeLogin } from '../store/middleware';
import { validateCampaign, putValidateCampaign } from '../store/validation';
import cote from "cote";
import {config} from "../store/config";

const requester = new cote.Requester({
    name: 'authentification',
    key: config.dev.communicationKEY,
});

export const CampaignController = express.Router();

CampaignController.get('/', needToBeAdmin , async (req, res) => {
    Campaign.find({}, function(err, targets) {
        let campaignsMap = [];

        targets.forEach((target) => {

            let PickedCampaign = _.pick(target, [
            '_id', 'ownerId','name','budget', 'budgetSpent', 'status', 'startingDate']);
            PickedCampaign.targets = target.targets;
            campaignsMap.push(PickedCampaign);
        });
        res.status(200).send(campaignsMap);
    });
});

CampaignController.put('/cost/:id', CampaignUserCheck, async (req, res) => {
    let campaign = await Campaign.findOne({ _id: req.params.id });

    if (campaign) {
        if (campaign['budgetSpent'] + req.body.cost > campaign['budget'])
            return res.status(200).json({error: "Your are trying to spend more than the campaign's budget."});
        campaign['budgetSpent'] += req.body.cost;
        campaign.save();
        return res.status(200).json(campaign);
    } else
        return res.status(404).json({error: "Campaign not found"});
});

CampaignController.get('/:id', CampaignUserCheck, async (req, res) => {
    let campaign = await Campaign.findOne({ _id: req.params.id });
    let targetedUsers = []
    let ageRanges = []
    let csps = []

    if (campaign) {
        const PickedCampaign = _.pick(campaign,
            ['_id', 'ownerId','name','budget', 'budgetSpent', 'status', 'startingDate']);
    
        let targetInfos = await new Promise((resolve, reject) => {
            let targetInfos = [];
            campaign.targets.forEach(async (item, index, array)=>{
                let target = await MarketingTarget.findOne({ _id: item });
                targetInfos.push({'ageRange': target.ageRange, 'csp': target.csp})
                if (array.length === index + 1)
                    resolve(targetInfos)
            })
        });
        const request = { type: 'users'}
        const users = await requester.send(request);

        targetInfos.forEach((item, index)=>{
            ageRanges.push(item['ageRange'])
            csps.push(item['csp'])
        })
        users.forEach((item, index)=>{
            if (ageRanges.includes(item['age']) && csps.includes(item['csp'])) {
                targetedUsers.push(item['_id'])
            }
        })
        PickedCampaign.targetedUsers = targetedUsers;
        PickedCampaign.targets = targetInfos;
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