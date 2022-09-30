import cote from "cote";

import {config} from "./config";

const requester = new cote.Requester({
    name: 'advertising',
    key: config.dev.communicationKEY
});

async function ownerOrAdmin(ownerId, jwt)
{
    const request = { type: 'ownerOrAdmin', ownerId: ownerId, jwt: jwt};
    return await requester.send(request);
}

export async function emptyMiddleware(req, res, next) {
    next();
}

export async function sendLog(logLvl, logContent, logChannels) {
    const request = { type: 'logs', logLvl: logLvl, logService: "Advertising", logContent: logContent, logChannels: logChannels};
    let aa = await requester.send(request)
    return aa;
  }