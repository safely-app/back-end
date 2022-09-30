import express from 'express';
import { RecurringRoute } from "../database/models/";
import { validateRecurringRouteCreation } from "../store/validation";
import {requestAuth} from "../store/middleware";

export const RecurringRouteController = express.Router();

RecurringRouteController.get('/', requestAuth, async (req, res) => {
  if (req.authResponse.role === 'empty')
    return res.status(401).json({message: "Unauthorized"})

  const recurring = await RecurringRoute.find({});

  if (recurring)
    res.status(200).json(recurring);
  else
    res.status(500).json({message: "No recurring routes found"});
})

RecurringRouteController.get('/:userId', requestAuth, async (req, res) => {
  if (req.authResponse.role === 'empty')
    return res.status(401).json({message: "Unauthorized"})

  const myRecurring = await RecurringRoute.find({userId: req.params.userId});

  if (myRecurring)
    res.status(200).json(myRecurring);
  else
    res.status(500).json({message: "No recurring routes found for this user"});
})

RecurringRouteController.post("/", requestAuth, async (req, res) => {
  if (req.authResponse.role === 'empty')
    return res.status(401).json({message: "Unauthorized"})

  const { error } = validateRecurringRouteCreation(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message});
  }

  const recurringRoute = {
    userId: req.body.userId,
    name: req.body.name,
    address: req.body.address,
    city: req.body.city,
    coordinate: req.body.coordinate
  };

  Object.keys(recurringRoute).forEach(key => recurringRoute[key] === undefined ? delete recurringRoute[key] : {});

  RecurringRoute.findOne({userId: recurringRoute.userId, name: recurringRoute.name})
    .then(async (found) => {
      if (found)
        res.status(403).json({message: "This route already exists"})
      else {
        const created = await RecurringRoute.create(recurringRoute);

        if (created)
          res.status(200).json({message: "Route created"});
        else
          res.status(500).json({message: "An error occured"});
      }
    })
})

RecurringRouteController.put("/:id", requestAuth, async (req, res) => {
  if (req.authResponse.role !== 'admin')
    return res.status(401).json({message: "Unauthorized"})

  const doc = {
    name: req.body.name,
    address: req.body.address,
    city: req.body.city,
    coordinate: req.body.coordinate
  }

  Object.keys(doc).forEach(key => doc[key] === undefined ? delete doc[key] : {});

  if ((doc.address || doc.city || doc.coordinate) && !(doc.address && doc.city && doc.coordinate))
    return res.status(403).json({error: 'If you want to update either the address or city or coordinate you need to specify all of them'})

  RecurringRoute.findByIdAndUpdate(req.params.id, doc, (err) => {
    if (err)
      return res.status(403).json({error: 'Update couldn\'t be proceed'})
    return res.status(200).json({success: 'Updated!'})
  })
})

RecurringRouteController.delete("/:id", requestAuth, async (req, res) => {
  if (req.authResponse.role !== 'admin')
    return res.status(401).json({message: "Unauthorized"})

  RecurringRoute.deleteOne({ _id: req.params.id })
    .then(() => {
      res.status(200).json({ message: 'Route deleted !' });
    })
    .catch((error) => {
      res.status(400).json({error: error});
    })
})