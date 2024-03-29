import dotenv from "dotenv";
import fs from "fs";

export const config = {
    dev: {
        port: process.env.PORT | 8080,
        mongoDBUri: 'mongodb://localhost/safely',
        mongoDBUriLog: 'mongodb://localhost/safely',
        mongoHostName: 'localhost',
        privateKEY: fs.readFileSync('./store/private.key'),
        publicKEY: fs.readFileSync('./store/public.key'),
        communicationKEY: dotenv.config().parsed.COMMUNICATION_KEY
    },
    prod: {
        port: process.env.PORT | 8080,
        mongoDBUri: process.env.DB_URL,
        mongoDBUriLog: 'mongodb://localhost/safely',
        mongoHostName: 'Production',
        privateKEY: fs.readFileSync('./store/private.key'),
        publicKEY: fs.readFileSync('./store/public.key'),
        communicationKEY: dotenv.config().parsed.COMMUNICATION_KEY
    },
    senderEmail: '"Safely" <noreply@safely.fr>',
    clientUrl: "https://front.safely-app.fr"
};
