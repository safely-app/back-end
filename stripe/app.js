import express from 'express';
import logger from 'winston';
import cors from 'cors';

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

const { port } = envConfig;

app.listen(port, () => {
  logger.info(`Started successfully server at port ${port}`);
});