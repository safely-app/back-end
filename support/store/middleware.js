import dotenv from "dotenv";
import cote from "cote";

import {config} from "./config";
import {SupportRequest} from "../database/models";

let requester;

if (dotenv.config().parsed.NODE_ENV === 'production')
  requester = new cote.Requester({ name: 'Extern Service authentification requester', key: config.prod.communicationKEY});
else
  requester = new cote.Requester({ name: 'Extern Service authentification requester', key: config.dev.communicationKEY});
  
export async function requestAuth(req, res, next) {
  let request = {};
  if (req && req.middleware_values && req.middleware_values._id)
    request = { type: 'owner or admin', jwt: req.headers.authorization, ownerId: req.middleware_values._id};
  else
    request = { type: 'owner or admin', jwt: req.headers.authorization, ownerId: " "};

  requester.send(request, (err, res) => {
    req.authResponse = res;
    next();
  });
}

async function ownerOrAdmin(ownerId, jwt) {
  const request = { type: 'owner or admin', ownerId: ownerId, jwt: jwt};
  return await requester.send(request);
}

export async function SupportUserCheck(req, res, next) {
  const support = await SupportRequest.findOne({_id: req.params.id});
  req.middleware_values = support
  req.middleware_values._id = support.ownerId

  const usertoken = req.headers.authorization;
  const response = await ownerOrAdmin(support.ownerId, usertoken);
  if (response.right === "false" || response.right === "no")
    return res.status(500).json({ error: response.right});
  next();
}
  
export async function AuthOrAdmin(req, res, next) {
  try {
    if (req.authResponse) {
      if (req.authResponse.role === "admin" || req.authResponse.right === "true")
        next();
      else {
        return res.status(403).json({error: 'Can\'t proceed to your request'});
      }
    }
  } catch {
    return res.status(401).json({error: 'Can\'t proceed to your request'});
  }
}
