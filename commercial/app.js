import express from 'express';
import mongoose from 'mongoose';
import logger from 'winston';
import cors from 'cors';

import 'winston-mongodb';

import {CampaignController, MarketingTargetController, AdvertisingController, NotificationsController, ModifController} from "./controller/";
import { config } from "./store/config";

const app = express();

app.use(cors());
app.use(express.urlencoded({extended: true, limit: '10mb'}));
app.use(bodyParser.json({limit: '10mb'}));
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

const log = logger.createLogger({
    level: 'info',
    format: logger.format.json(),
    transports: [new logger.transports.MongoDB({db: mongoDBUriLog, collection: 'logs', level: 'info'}), new logger.transports.Console({level: "info", colorize: true})],
  });

app.locals.log = log;

app.listen(port, () => {
  log.info(`Commercial Started successfully server at port ${port}`);
  mongoose
    .connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((res) => {
      log.info(`Commercial Conneted to mongoDB at ${mongoHostName}`);
    })
    .catch((error) => {
      log.db.error(`Commercial`, error);
    });
});