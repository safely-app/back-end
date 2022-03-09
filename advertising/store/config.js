export const config = {
  dev: {
    port: process.env.PORT | 8084,
    commercialURL: "http://localhost:8088/"
  },
  prod: {
    port: process.env.PORT | 8084,
    commercialURL: "https://api.safely-app.fr/commercial/"
  }
};
