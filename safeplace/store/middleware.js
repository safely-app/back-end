import dotenv from "dotenv";
import cote from "cote";

import {config} from "./config";
import { RequestClaimSafeplace, SafeplaceComment } from "../database/models";

let requester;

if (dotenv.config().parsed.NODE_ENV === 'production')
  requester = new cote.Requester({ name: 'Extern Service authentification requester', key: config.prod.communicationKEY});
else
  requester = new cote.Requester({ name: 'Extern Service authentification requester', key: config.dev.communicationKEY});

export async function RequestClaimSafeplaceUserCheck(req, res, next) {
  try {
    const requestClaimSafeplace = await RequestClaimSafeplace.findOne({_id: req.params.id});
    req.middleware_values = requestClaimSafeplace
    req.middleware_values._id = requestClaimSafeplace.userId
    next();
  } catch {
    return res.status(404).json({error: "Request / Claim safeplace not found"});
  }
}

export async function SafeplaceCommentUserCheck(req, res, next) {
  try {
    const safeplaceComment = await SafeplaceComment.findOne({_id: req.params.id});
    req.middleware_values = safeplaceComment
    req.middleware_values._id = safeplaceComment.userId
    next();
  } catch {
    return res.status(404).json({error: "Safeplace comment not found"});
  }
}
  
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