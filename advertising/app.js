import express from 'express';
import cors from 'cors';

import { userAlgoController, costHandler } from "./controller";
import mongoose from "mongoose";
import { config } from "./store/config";
import { sendLog } from '../authentification/store/utils';

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

app.listen(port, () => {
  sendLog()
  log.info(`Advertising Started successfully server at port ${port}`);
  mongoose
      .connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true })
      .then((res) => {
        log.info(`Advertising Conneted to mongoDB at ${mongoHostName}`);
      })
      .catch((error) => {
        log.info(`Advertising `, error);
      });
});