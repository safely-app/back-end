import express from 'express';
import mongoose from 'mongoose';
import logger from 'winston';
import cors from 'cors';

import 'winston-mongodb';

import {CampaignController, MarketingTargetController, AdvertisingController, NotificationsController, ModifController} from "./controller/";
import { config } from "./store/config";

const app = express();

app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use("/target", MarketingTargetController);
app.use("/campaign", CampaignController);
app.use("/advertising", AdvertisingController);
app.use("/notifications", NotificationsController);
app.use("/modif", ModifController);

let envConfig;

if (process.env.NODE_ENV === 'production')
  envConfig = config.prod;
else
  envConfig = config.dev;

const { port, mongoDBUri, mongoDBUriLog, mongoHostName } = envConfig;

const log = {
  cnsl: logger.createLogger({
    level: 'info',
    format: logger.format.simple(),
    transports: [new logger.transports.Console({level: "info", colorize: true})],
  }),

  db: logger.createLogger({
    level: 'info',
    format: logger.format.json(),
    transports: [new logger.transports.MongoDB({db: mongoDBUriLog, collection: 'logs', level: 'info'})],
  })
};

app.locals.log = log;

app.listen(port, () => {
  log.db.info(`Commercial Started successfully server at port ${port}`);
  log.cnsl.info(`Started successfully server at port ${port}`);
  mongoose
    .connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((res) => {
      log.db.info(`Commercial Conneted to mongoDB at ${mongoHostName}`);
      log.cnsl.info(`Conneted to mongoDB at ${mongoHostName}`);
    })
    .catch((error) => {
      log.db.error(`Commercial`, error);
      log.cnsl.error(error);
    });
});