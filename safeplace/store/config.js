import dotenv from "dotenv";

export const config = {
  dev: {
    port: process.env.PORT | 8081,
    mongoDBUri: 'mongodb://localhost/safely',
    mongoHostName: 'localhost',
    communicationKEY: dotenv.config().parsed.COMMUNICATION_KEY
  },
  prod: {
    port: process.env.PORT | 8081,
    mongoDBUri: 'mongodb://localhost/safely',
    mongoHostName: 'localhost',
    communicationKEY: dotenv.config().parsed.COMMUNICATION_KEY
  },
};
