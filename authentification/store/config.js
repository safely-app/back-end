import dotenv from "dotenv";
import fs from "fs";

export const config = {
    dev: {
        port: 8080,
        mongoDBUri: 'mongodb://localhost/safely',
        mongoHostName: 'localhost',
        privateKEY: fs.readFileSync('./store/private.key'),
        publicKEY: fs.readFileSync('./store/public.key'),
        communicationKEY: dotenv.config().parsed.COMMUNICATION_KEY
    },
    prod: {
        port: 8080,
        mongoDBUri: process.env.DB_URL,
        mongoHostName: 'Production',
        privateKEY: fs.readFileSync('./store/private.key'),
        publicKEY: fs.readFileSync('./store/public.key'),
        communicationKEY: dotenv.config().parsed.COMMUNICATION_KEY
    },
    senderEmail: '"Safely" <noreply@safely.fr>',
    clientUrl: "https://front.safely-app.fr"
};