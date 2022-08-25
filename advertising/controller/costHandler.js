import express from 'express';
import { Pricing } from '../database/models';
import { ValidateCostEdition, ValidateCostPost } from '../store/validation';
import { computeCost, saveCostHistory } from '../utils/connector';

export const costHandler = express.Router();

costHandler.get('/', async (req, res) => {
    let pricing = await Pricing.find({});
	if (pricing.length == 0)
		return res.status(404).json({ message: 'Any pricing found' });
	return res.status(200).send(pricing);
});

costHandler.post('/', async (req, res) => {
    const { error } = ValidateCostEdition(req.body);

    if (error)
      return res.status(400).json({ error: error.details[0].message});

	let price = await Pricing.findOne({costType: req.body.costType});
	if (price)
		return res.status(400).json({ error: 'Cost type already exists' });

	let pricing = new Pricing(req.body);
	await pricing.save();
	
	return res.status(200).send({
		message: `${req.body.costType} created.`,
	});
});

costHandler.put('/', async (req, res) => {
    const { error } = ValidateCostEdition(req.body);
	const newBody = req.body;

    if (error)
    	return res.status(400).json({ error: error.details[0].message});
	if (newBody._id)
		delete newBody._id
  
	Pricing.updateOne({costType: req.body.costType}, newBody, (err) => {
	  if (err)
		  return res.status(403).json({error: 'Update couldn\'t be proceed'})
	  return res.status(200).json({success: 'Updated!'})
  })
});

costHandler.post('/event', async (req, res) => {
    const { error } = ValidateCostPost(req.body);

    if (error)
      return res.status(400).json({ error: error.details[0].message});
    const data = await computeCost(req.body.event, req.body.campaign, req.headers.authorization)
    if (data.error)
        return res.status(403).send({error: data.error});
	saveCostHistory(data);
    return res.status(200).send({
		message: `${req.body.event} registered.`,
		matchingCost: data.matchingCost,
		eventCost: data.eventCost,
		eventCostRatio: data.eventCostRatio,
		totalCost: data.totalCost,
	});
});