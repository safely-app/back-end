import express from 'express';
import mongoose from 'mongoose';
import logger from 'winston';
import cors from 'cors';


import {
  SupportRequestController,
} from "./controller";
import { config } from "./store/config";

const app = express();

app.use(cors());
app.use(express.urlencoded({extended: false, limit: "5mb"}));
app.use(express.json({limit: "5mb"}));

app.use("/support", SupportRequestController);

let envConfig;

if (process.env.NODE_ENV === 'production')
  envConfig = config.prod;
else
  envConfig = config.dev;

const { port, mongoDBUri, mongoHostName } = envConfig;

app.listen(port, () => {
  logger.info(`Started successfully server at port ${port}`);
  mongoose
    .connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((res) => {
      logger.info(`Conneted to mongoDB at ${mongoHostName}`);
    })
    .catch((error) => {
      logger.error(error);
    });
});