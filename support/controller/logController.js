import express from 'express';
import { Log } from "../database/models";
import {requestAuth, ownerOrAdmin, sendLog} from "../store/middleware";

export const LogController = express.Router();

LogController.get('/', async (req, res) => {
  sendLog("TEST", "LogController get", "");

  res.status(200).send();

})