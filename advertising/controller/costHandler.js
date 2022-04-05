import express from 'express';
import { ValidateCostPost } from '../store/validation';
import { sendAdEvent } from '../utils/connector';

export const costHandler = express.Router();

costHandler.post('/', async (req, res) => {
    const { error } = ValidateCostPost(req.body);

    if (error)
      return res.status(400).json({ error: error.details[0].message});
    const data = await sendAdEvent(req.body.event, req.body.campaign, req.headers.authorization)
    if (data.error)
        return res.status(403).send({error: data.error});
    return res.status(200).send({message: `${req.body.event} registered.`});
});