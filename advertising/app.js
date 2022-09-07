import express from 'express';
import logger from 'winston';
import cors from 'cors';

import { userAlgoController, costHandler } from "./controller";
import mongoose from "mongoose";
import { config } from "./store/config";

require('winston-mongodb').MongoDB;

const app = express();

app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use("/userAlgo", userAlgoController);
app.use("/cost", costHandler);

let envConfig;

if (process.env.NODE_ENV == 'production')
    envConfig = config.prod;
else
    envConfig = config.dev;

const { port, mongoDBUri, mongoHostName } = envConfig;

const log = {
  cnsl: logger.createLogger({
    level: 'info',
    format: logger.format.simple(),
    transports: [new logger.transports.Console({level: "info", colorize: true})],
  }),

  db: logger.createLogger({
    level: 'info',
    format: logger.format.json(),
    transports: [new logger.transports.MongoDB({db: mongoDBUri, collection: 'log', level: 'info'})],
  })
};

app.locals.log = log;

app.listen(port, () => {
  log.db.info(`Advertising Started successfully server at port ${port}`);
  log.cnsl.info(`Started successfully server at port ${port}`);
  mongoose
      .connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true })
      .then((res) => {
        log.db.info(`Advertising Conneted to mongoDB at ${mongoHostName}`);
        log.cnsl.info(`Advertising  Conneted to mongoDB at ${mongoHostName}`);
      })
      .catch((error) => {
        log.db.info(`Advertising `, error);
        log.cnsl.error(`Advertising `, error);
      });
});