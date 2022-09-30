import express from 'express';
import cors from 'cors';

import { userAlgoController, costHandler } from "./controller";
import mongoose from "mongoose";
import { config } from "./store/config";
import { sendLog } from './store/middleware';

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
  console.log(`Advertising service listening at http://localhost:${port}`);
  sendLog("Server", "Advertising Started successfully", "");
  mongoose
      .connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true })
      .then((res) => {
        sendLog("Server", "Advertising Conneted to mongoDB", "");
      })
      .catch((error) => {
        sendLog("Error", error, "");
      });
});