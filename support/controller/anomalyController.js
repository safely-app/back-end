import express from 'express';
import { Anomaly } from "../database/models/";
import { validateAnomalyCreation, validateAnomalyUpdate } from "../store/validation";
import {AnomalyUserCheck, requestAuth} from "../store/middleware";

export const AnomalyController = express.Router();

AnomalyController.get('/', requestAuth, async (req, res) => {
  if (req.authResponse.role !== 'admin')
    return res.status(401).json({message: "Unauthorized"})

  const anomaly = await Anomaly.find({});

  if (anomaly)
    res.status(200).json(anomaly);
  else
    res.status(500).json({message: "No anomaly requests found"});
})

AnomalyController.get('/validated', requestAuth, async (req, res) => {
  if (req.authResponse.role !== 'admin')
    return res.status(401).json({message: "Unauthorized"});

  const anomaly = await Anomaly.find({score: {$gt: 1}});

  if (anomaly)
    res.status(200).json(anomaly);
  else
    res.status(500).json({message: "No validated anomaly requests found"});
})

AnomalyController.get('/toValidate', requestAuth, async (req, res) => {
  if (req.authResponse.role === 'empty')
    return res.status(401).json({message: "Unauthorized"});

  const anomaly = await Anomaly.find({score: {$lt: 2}});

  if (anomaly)
    res.status(200).json(anomaly);
  else
    res.status(500).json({message: "No validated anomaly requests found"});
})

AnomalyController.get('/user/:userId', requestAuth, async (req, res) => {
  if (req.authResponse.role === 'empty')
    return res.status(401).json({message: "Unauthorized"})

  const anomaly = await Anomaly.find({userId: req.params.userId});

  if (anomaly)
    res.status(200).json(anomaly);
  else
    res.status(500).json({message: "No anomaly requests found for this user"});
})

AnomalyController.get('/:id', requestAuth, async (req, res) => {
  if (req.authResponse.role === 'empty')
    return res.status(401).json({message: "Unauthorized"})

  const anomaly = await Anomaly.findOne({_id: req.params.id});

  if (anomaly)
    res.status(200).json(anomaly);
  else
    res.status(500).json({message: "Support request not found"});
})

AnomalyController.post("/validate/:id", requestAuth, async (req, res) => {
  if (req.authResponse.role === 'empty')
    return res.status(401).json({message: "Unauthorized"})

  const anomaly = await Anomaly.findOne({_id: req.params.id});

  if (anomaly) {
    Anomaly.findByIdAndUpdate(anomaly._id, {score: anomaly.score + 1}, (err) => {
      if (err)
        res.status(500).json({message: "An error occured"});
      res.status(200).json({message: "Anomaly created"});
    })
  } else
    res.status(500).json({message: "Anomaly not found"});
})

AnomalyController.post("/", requestAuth, async (req, res) => {
  if (req.authResponse.role === 'empty')
    return res.status(401).json({message: "Unauthorized"})

  const { error } = validateAnomalyCreation(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message});
  }

  const anomaly = await Anomaly.findOne({street: req.body.street});

  if (anomaly) {
    Anomaly.findByIdAndUpdate(anomaly._id, {score: anomaly.score + 1}, (err) => {
      if (err)
        res.status(500).json({message: "An error occured"});
      res.status(200).json({message: "Anomaly created"});
    })
  } else {
    const anomaly = {
      userId: req.body.userId,
      comment: req.body.comment,
      type: req.body.type,
      score: 0,
      street: req.body.street
    };

    Object.keys(anomaly).forEach(key => anomaly[key] === undefined ? delete anomaly[key] : {});

    const created = await Anomaly.create(anomaly);

    if (created)
      res.status(200).json({message: "Anomaly created"});
    else
      res.status(500).json({message: "An error occured"});
  }
})

AnomalyController.put("/:id", AnomalyUserCheck, async (req, res) => {
  const { error } = validateAnomalyUpdate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message});
  }

  const anomaly = {
    comment: req.body.comment,
    type: req.body.type,
    street: req.body.street
  };

  Object.keys(anomaly).forEach(key => anomaly[key] === undefined ? delete anomaly[key] : {});

  Anomaly.findByIdAndUpdate(req.params.id, anomaly, (err) => {
    if (err)
      return res.status(403).json({error: 'Update couldn\'t be proceed'})
    return res.status(200).json({success: 'Updated!'})
  })
})

AnomalyController.delete("/:id", AnomalyUserCheck, async (req, res) => {
  Anomaly.deleteOne({ _id: req.params.id })
    .then(() => {
      res.status(200).json({ message: 'Support request deleted !' });
    })
    .catch((error) => {
      res.status(400).json({error: error});
    })
})