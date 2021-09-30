import cote from "cote";
import dotenv from "dotenv";

import { config } from "./config";

let key;
if (dotenv.config().parsed.NODE_ENV === 'production')
  key = config.prod.communicationKEY;
else
  key = config.dev.communicationKEY;

const requester = new cote.Requester({ name: 'StripeService', key:key });

export async function requestAuth(req, res, next) {
    const request = { type: 'owner or admin', ownerId: "", jwt: req.headers.authorization};
    req.authRespons = await requester.send(request);
    if (req.authRespons.userId)
        next();
    else
        res.status(403).json({error: "You need to be connected"});
}

export async function stripeUserCreation(jwt, stripeId) {
    const request = { type: 'stripeUserCreation', jwt: jwt, stripeId: stripeId};
    return await requester.send(request);
}

export async function stripeUserInfo(jwt) {
    const request = { type: 'stripeUserInfo', jwt: jwt};
    return await requester.send(request);
}