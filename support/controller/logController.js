import express from 'express';
import { Log } from "../database/models";
import {requestAuth, ownerOrAdmin} from "../store/middleware";

export const LogController = express.Router();

LogController.get('/', requestAuth,  async (req, res) => {
  // if (req.authResponse.role !== 'admin')
  //   return res.status(401).json({message: "Unauthorized"})

  const log = await Log.find({});

  res.status(200).send(log);

})