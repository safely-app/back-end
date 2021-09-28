export const config = {
  dev: {
    port: 8081,
    mongoDBUri: 'mongodb://localhost/commercial',
    mongoHostName: 'localhost',
    communicationKEY: process.env.communicationKEY
  },
  prod: {
    port: 8081,
    mongoDBUri: 'mongodb://localhost/commercial',
    mongoHostName: 'localhost',
    communicationKEY: process.env.communicationKEY
  }
};