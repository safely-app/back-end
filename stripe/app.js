import express from 'express';
import logger from 'winston';
import cors from 'cors';

import 'winston-mongodb';

import {StripeController} from "./controller";
import { config } from "./store/config";

const app = express();

app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use("/stripe", StripeController);

let envConfig;

if (process.env.NODE_ENV === 'production')
  envConfig = config.prod;
else
  envConfig = config.dev;

const { port, COMMUNICATION_KEY, mongoDBUri } = envConfig;

const log = logger.createLogger({
    level: 'info',
    format: logger.format.json(),
    transports: [new logger.transports.MongoDB({db: mongoDBUri, collection: 'logs', level: 'info'}), new logger.transports.Console({level: "info", colorize: true})],
  });

app.locals.log = log;

app.listen(port, () => {
  log.info(`Stripe Started successfully server at port ${port}`);
});