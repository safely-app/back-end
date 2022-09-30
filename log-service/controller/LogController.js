import express from 'express';
import fetch from 'node-fetch';
import dotenv from "dotenv";

import { Log } from "../database/models";
import { createLog } from '../store/utils';

export const LogController = express.Router();

LogController.get('/', async (req, res) => {

  const log = await Log.find({});

  if (log)
    res.status(200).json(log);
  else
    res.status(500).json({message: "No logs found"});
})

LogController.get('/:logId', async (req, res) => {

  const myLog = await Log.find({ _id: req.params.logId});

  if (myLog)
    res.status(200).json(myLog);
  else
    res.status(500).json({message: "No log found"});
})

LogController.post("/", async (req, res) => {
  const log = {
    logLvl: req.body.logLvl,
    logService: req.body.logService,
    logContent: req.body.logContent,
    LogChannels: req.body.logChannels
  };

  const msg = createLog(log);

  if (msg.match("Log created"))
    res.status(200).json(msg);
  else
    res.status(500).json({message: msg});
})

LogController.delete("/:id", async (req, res) => {

  Log.deleteOne({ _id: req.params.id })
    .then(() => {
      res.status(200).json({ message: 'Log deleted !' });
    })
    .catch((error) => {
      res.status(400).json({error: error});
    })
})