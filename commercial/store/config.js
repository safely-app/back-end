import dotenv from "dotenv";

export const config = {
  dev: {
    port: process.env.PORT | 8088,
    mongoDBUri: 'mongodb://localhost/commercial',
    mongoDBUriLog: 'mongodb://localhost/safely',
    mongoHostName: 'localhost',
    communicationKEY: dotenv.config().parsed.COMMUNICATION_KEY
  },
  prod: {
    port: process.env.PORT | 8088,
    mongoDBUri: 'mongodb://localhost/commercial',
    mongoDBUriLog: 'mongodb://localhost/safely',
    mongoHostName: 'localhost',
    communicationKEY: dotenv.config().parsed.COMMUNICATION_KEY
  }
};
