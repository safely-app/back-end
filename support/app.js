import express from 'express';
import mongoose from 'mongoose';
import logger from 'winston';
import cors from 'cors';

import 'winston-mongodb';

import {
  SupportRequestController,
  AnomalyController,
  LogController
} from "./controller";
import { config } from "./store/config";

const app = express();

app.use(cors());
app.use(express.urlencoded({extended: false, limit: "5mb"}));
app.use(express.json({limit: "5mb"}));

app.use("/support", SupportRequestController);
app.use("/anomaly", AnomalyController);
app.use("/log", LogController);

let envConfig;

if (process.env.NODE_ENV === 'production')
  envConfig = config.prod;
else
  envConfig = config.dev;

const { port, mongoDBUri, mongoHostName } = envConfig;

const log = logger.createLogger({
    level: 'info',
    format: logger.format.json(),
    transports: [new logger.transports.MongoDB({db: mongoDBUri, collection: 'logs', level: 'info'}), new logger.transports.Console({level: "info", colorize: true})],
  });

app.locals.log = log;

app.listen(port, () => {
  log.info(`Support Started successfully server at port ${port}`);
  mongoose
    .connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((res) => {
      log.info(`Support Conneted to mongoDB at ${mongoHostName}`);
    })
    .catch((error) => {
      log.db.error(`Support`, error);
    });
});