import dotenv from 'dotenv';

export const config = {
  dev: {

    port: process.env.PORT | 8083,
    communicationKEY: dotenv.config().parsed.COMMUNICATION_KEY,
    mongoDBUri: 'mongodb://localhost/safely',
  },
  prod: {
    port: process.env.PORT | 8083,
    communicationKEY: dotenv.config().parsed.COMMUNICATION_KEY,
    mongoDBUri: 'mongodb://localhost/safely',
  }
};
