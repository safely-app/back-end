import express from 'express';
import { SupportRequest } from "../database/models/";
import { validateSupportRequestCreation, validateSupportRequestUpdate } from "../store/validation";
import {requestAuth, SupportUserCheck} from "../store/middleware";

export const SupportRequestController = express.Router();

SupportRequestController.get('/', async (req, res) => {
  // if (req.authResponse.role === 'admin')
  //   return res.status(401).json({message: "Unauthorized"})

  const support = await SupportRequest.find({});

  if (support)
    res.status(200).json(support);
  else
    res.status(500).json({message: "No support requests found"});
})

SupportRequestController.get('/user/:userId', async (req, res) => {
  // if (req.authResponse.role === 'empty')
  //   return res.status(401).json({message: "Unauthorized"})

  const support = await SupportRequest.find({userId: req.params.userId});

  if (support)
    res.status(200).json(support);
  else
    res.status(500).json({message: "No support requests found for this user"});
})

SupportRequestController.get('/:id', async (req, res) => {
  // if (req.authResponse.role === 'empty')
  //   return res.status(401).json({message: "Unauthorized"})

  const support = await SupportRequest.findOne({_id: req.params.id});

  if (support)
    res.status(200).json(support);
  else
    res.status(500).json({message: "Support request not found"});
})

SupportRequestController.post("/", async (req, res) => {
  // if (req.authResponse.role === 'empty')
  //   return res.status(401).json({message: "Unauthorized"})

  const { error } = validateSupportRequestCreation(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message});
  }

  const supportRequest = {
    userId: req.body.userId,
    title: req.body.title,
    comment: req.body.comment,
    type: req.body.type
  };

  Object.keys(supportRequest).forEach(key => supportRequest[key] === undefined ? delete supportRequest[key] : {});

  const created = await SupportRequest.create(supportRequest);

  if (created)
    res.status(200).json({message: "Request created"});
  else
    res.status(500).json({message: "An error occured"});
})

SupportRequestController.put("/:id", async (req, res) => {
  const { error } = validateSupportRequestUpdate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message});
  }

  const doc = {
    title: req.body.title,
    comment: req.body.comment,
    type: req.body.type
  }

  Object.keys(doc).forEach(key => doc[key] === undefined ? delete doc[key] : {});

  SupportRequest.findByIdAndUpdate(req.params.id, doc, (err) => {
    if (err)
      return res.status(403).json({error: 'Update couldn\'t be proceed'})
    return res.status(200).json({success: 'Updated!'})
  })
})

SupportRequestController.delete("/:id", async (req, res) => {
  SupportRequest.deleteOne({ _id: req.params.id })
    .then(() => {
      res.status(200).json({ message: 'Support request deleted !' });
    })
    .catch((error) => {
      res.status(400).json({error: error});
    })
})