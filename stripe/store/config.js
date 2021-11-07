import dotenv from 'dotenv';

export const config = {
  dev: {
    port: 8083,
    communicationKEY: dotenv.config().parsed.COMMUNICATION_KEY,
  },
  prod: {
    port: 8083,
    communicationKEY: dotenv.config().parsed.COMMUNICATION_KEY,
  }
};