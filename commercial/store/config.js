import dotenv from "dotenv";

export const config = {
  dev: {
    port: 8081,
    mongoDBUri: 'mongodb://localhost/commercial',
    mongoHostName: 'localhost',
    communicationKEY: dotenv.config().parsed.COMMUNICATION_KEY
  },
  prod: {
    port: 8081,
    mongoDBUri: 'mongodb://localhost/commercial',
    mongoHostName: 'localhost',
    communicationKEY: dotenv.config().parsed.COMMUNICATION_KEY
  }
};