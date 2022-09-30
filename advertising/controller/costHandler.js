import express from 'express';
import { Pricing, PricingHistory } from '../database/models';
import { ValidateCostEdition, ValidateCostPost } from '../store/validation';
import { computeCost, saveCostHistory } from '../utils/connector';

export const costHandler = express.Router();

costHandler.get('/', async (req, res) => {
    let pricing = await Pricing.find({});
	if (pricing.length == 0) {
		req.app.locals.log.db.error(`CostHandler get/, Any pricing found`);
		return res.status(404).json({ message: 'Any pricing found' });
	}
	req.app.locals.log.db.info(`CostHandler get/, get pricing`);
	return res.status(200).send(pricing);
});

costHandler.post('/', async (req, res) => {
    const { error } = ValidateCostEdition(req.body);

    if (error) {
		req.app.locals.log.db.error(`CostHandler post/`, error.details[0].message);
		return res.status(400).json({ error: error.details[0].message});
	}

	let price = await Pricing.findOne({costType: req.body.costType});
	if (price) {
		req.app.locals.log.db.error(`CostHandler post/ Cost type already exists`);
		return res.status(400).json({ error: 'Cost type already exists' });
	}

	let pricing = new Pricing(req.body);
	await pricing.save();
	
	req.app.locals.log.db.info(`CostHandler post/ Created`);
	return res.status(200).send({
		message: `${req.body.costType} created.`,
	});
});

costHandler.put('/', async (req, res) => {
    const { error } = ValidateCostEdition(req.body);
	const newBody = req.body;

    if (error) {
		req.app.locals.log.db.error(`CostHandler put/`, error.details[0].message);
    	return res.status(400).json({ error: error.details[0].message});
	}
	if (newBody._id)
		delete newBody._id
  
	Pricing.updateOne({costType: req.body.costType}, newBody, (err) => {
	  if (err) {
		req.app.locals.log.db.error(`CostHandler put/ Update couldn't be proceed`);
		return res.status(403).json({error: 'Update couldn\'t be proceed'})
	}
		req.app.locals.log.db.error(`CostHandler put/ Updated`);
	  return res.status(200).json({success: 'Updated!'})
  })
});

costHandler.get('/history', async (req, res) => {
	const history = await PricingHistory.find({});

	if (history) {
		req.app.locals.log.db.error(`CostHandler history/ getted`);
		return res.status(200).json(history);
	} else {
		req.app.locals.log.db.error(`CostHandler history/ No histories found.`);
		return res.status(500).json({ error: "No histories found."});
	}
});

costHandler.post('/event', async (req, res) => {
    const { error } = ValidateCostPost(req.body);

    if (error) {
		req.app.locals.log.db.error(`CostHandler event/ `, error.details[0].message);
		return res.status(400).json({ error: error.details[0].message});
	}
    const data = await computeCost(req.body.event, req.body.campaign, req.headers.authorization)
    if (data.error) {
		req.app.locals.log.db.error(`CostHandler event/ `, data.error);
        return res.status(403).send({error: data.error});
	}
	await saveCostHistory(data, req.body.campaign, req.body.event);
	req.app.locals.log.db.info(`CostHandler event/ sended`);
    return res.status(200).send({
		message: `${req.body.event} registered.`,
		matchingCost: data.matchingCost,
		eventCost: data.eventCost,
		eventCostRatio: data.eventCostRatio,
		totalCost: data.totalCost,
	});
});