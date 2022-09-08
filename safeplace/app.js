import express from 'express';
import mongoose from 'mongoose';
import logger from 'winston';
import cors from 'cors';

import 'winston-mongodb';

import {
  SafeplaceController,
  RecurringRouteController,
  SafeplaceCommentController,
  RequestClaimSafeplaceController,
  MailingController,
  TrajectController
} from "./controller";
import { fetchMarket } from "./store/utils";
import { config } from "./store/config";

const app = express();

app.use(cors());
app.use(express.urlencoded({extended: false, limit: "5mb"}));
app.use(express.json({limit: "5mb"}));

app.use("/safeplace", SafeplaceController);
app.use("/recurring", RecurringRouteController);
app.use("/requestClaimSafeplace", RequestClaimSafeplaceController);
app.use("/comment", SafeplaceCommentController);
app.use("/mailing", MailingController);
app.use("/traject", TrajectController);

// setInterval(async () => {
//   await fetchMarket();
// }, 1000);
fetchMarket();

let envConfig;

if (process.env.NODE_ENV === 'production')
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
  log.db.info(`Safeplace Started successfully server at port ${port}`);
  log.cnsl.info(`Started successfully server at port ${port}`);
  mongoose
    .connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((res) => {
      log.db.info(`Safeplace Conneted to mongoDB at ${mongoHostName}`);
      log.cnsl.info(`Conneted to mongoDB at ${mongoHostName}`);
    })
    .catch((error) => {
      log.db.error(`Safeplace`, error);
      log.cnsl.error(error);
    });
});