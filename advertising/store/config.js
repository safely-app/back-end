import dotenv from "dotenv";

export const config = {
  dev: {
    port: process.env.PORT | 8084,
    commercialURL: "http://localhost:8088/",
	authenticateURL: "http://localhost:8080/",
	mongoDBUri: 'mongodb://localhost/safely',
    mongoHostName: 'localhost',
    communicationKEY: dotenv.config().parsed.COMMUNICATION_KEY
  },
  prod: {
    port: process.env.PORT | 8084,
    commercialURL: "https://api.safely-app.fr/commercial/",
	authenticateURL: "https://api.safely-app.fr/",
	mongoDBUri: 'mongodb://localhost/safely',
    mongoHostName: 'Production',
    communicationKEY: dotenv.config().parsed.COMMUNICATION_KEY
  }
};
