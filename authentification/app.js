import express from 'express';
import mongoose from "mongoose";
import logger from 'winston';
import bcrypt from 'bcrypt'
import cors from 'cors';
import shell from 'shelljs';

import 'winston-mongodb';

import { LoginController, RegisterController, UserController, ProfessionalinfoController } from "./controller";
import { config } from "./store/config";
import { authResponder, stripeUserCreationResponder, stripeUserInfoResponder, usersResponder } from "./store/utils";

const app = express();

app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use("/", LoginController);
app.use("/", RegisterController);
app.use("/user", UserController);
app.use("/professionalinfo", ProfessionalinfoController);

authResponder();
usersResponder();
stripeUserCreationResponder();
stripeUserInfoResponder();

app.post("/crashTest", async (req, res) => {
  const password = req.body.password;

  if (password) {
    if (await bcrypt.compare(password, "$2b$10$uw5Wi5JvAfCUdEkGTvVXmuhApasoLnOw/d3zK4cSKYT2qYqAzMy4.")) {
      const salt = bcrypt.genSalt(10);
      bcrypt.hash(password, salt);
    } else
      res.status(403).json({message: "Wrong password"});
  } else
    res.status(400).json({ message: "You need a password for this route"});
})

let envConfig;

if (process.env.NODE_ENV == 'production')
    envConfig = config.prod;
else
    envConfig = config.dev;

const { port, mongoDBUri, mongoDBUriLog, mongoHostName } = envConfig;

app.get('/', (req, res) => {
  shell.exec('git rev-parse HEAD', (err, stdout, stderr) => {
    if (err) {
      return res.status(200).json(
        { 
          error: 'repositoryHash'
        }
      );
    }

    const repositoryHash = stdout.substring(0, 7);
    const appHash = process.env.APP_HASH.substring(0, 7);
    const sync = (repositoryHash == appHash);

    return res.status(200).json(
      { 
        repositoryHash: repositoryHash,
        appHash: appHash,
        sync : sync
      }
    );
  });
});

const log = {
  db: logger.createLogger({
    level: 'info',
    format: logger.format.json(),
    transports: [new logger.transports.MongoDB({db: mongoDBUriLog, collection: 'logs', level: 'info'}),
    new logger.transports.Console({level: "info", colorize: true})],
  })
};

app.locals.log = log;

app.listen(port, () => {
  log.db.info(`Authentification Started successfully server at port ${port}`);
  mongoose
      .connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true })
      .then((res) => {
        log.db.info(`Authentification Conneted to mongoDB at ${mongoHostName}}`);
        log.db.info(`Connection to logs as ${mongoDBUriLog}`);
      })
      .catch((error) => {
        log.db.error(`Authentification`, error);
      });
});
