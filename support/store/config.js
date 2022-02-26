import dotenv from "dotenv";

export const config = {
  dev: {
    port: process.env.PORT | 8085,
    mongoDBUri: 'mongodb://localhost/safely',
    mongoHostName: 'localhost',
    communicationKEY: dotenv.config().parsed.COMMUNICATION_KEY
  },
  prod: {
    port: process.env.PORT | 8085,
    mongoDBUri: 'mongodb://localhost/safely',
    mongoHostName: 'localhost',
    communicationKEY: dotenv.config().parsed.COMMUNICATION_KEY
  },
  senderEmail: '"Safely" <noreply@safely.fr>',
  clientUrl: "https://front.safely-app.fr"
};
