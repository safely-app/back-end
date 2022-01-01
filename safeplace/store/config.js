import dotenv from "dotenv";

export const config = {
  dev: {
    port: process.env.PORT | 8081,
    mongoDBUri: 'mongodb://localhost/safely',
    mongoHostName: 'localhost',
    communicationKEY: dotenv.config().parsed.COMMUNICATION_KEY,
    GOOGLE_API_KEY: dotenv.config().parsed.GOOGLE_API_KEY
  },
  prod: {
    port: process.env.PORT | 8081,
    mongoDBUri: 'mongodb://localhost/safely',
    mongoHostName: 'localhost',
    communicationKEY: dotenv.config().parsed.COMMUNICATION_KEY,
    GOOGLE_API_KEY: dotenv.config().parsed.GOOGLE_API_KEY
  },
  senderEmail: '"Safely" <noreply@safely.fr>',
  clientUrl: "https://front.safely-app.fr"
};
