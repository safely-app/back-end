import Joi from "joi";
import jwt, { decode } from "jsonwebtoken";
import str from "@supercharge/strings";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

import User from "../database/models/userModel";
import {config} from "./config";
import { ProfessionalInfo } from "../database/models";
import cote from "cote";
import CryptoJS from "crypto-js";

let communicationkey;
if (dotenv.config().parsed.NODE_ENV === 'production')
  communicationkey = config.prod.communicationKEY;
else
  communicationkey = config.dev.communicationKEY;

const responder = new cote.Responder({
    name: 'authentification',
    key: communicationkey,
});

let requester;

if (dotenv.config().parsed.NODE_ENV === 'production')
  requester = new cote.Requester({ name: 'Extern Service authentification requester', key: config.prod.communicationKEY});
else
  requester = new cote.Requester({ name: 'Extern Service authentification requester', key: config.dev.communicationKEY});

export function validateLogin(user) {
  const schema = Joi.object({
    email: Joi.string() .min(1) .max(255) .required() .email(),
    password: Joi.string() .min(1) .max(255) .required()
  });

  return schema.validate(user);
}

export function validateRegister(user) {
  const schema = Joi.object({
    username: Joi.string() .min(1) .max(50) .required(),
    email: Joi.string() .min(1) .max(255) .required() .email(),
    password: Joi.string() .min(1) .max(255) .required()
  });

  return schema.validate(user);
}

export function validateChangePassword(body) {
  const schema = Joi.object({
    userId: Joi.string() .min(1) .max(255) .required(),
    token: Joi.string() .min(1) .max(255) .required(),
    password: Joi.string() .min(1) .max(255) .required()
  });

  return schema.validate(body)
}

export function validateUpdateUser(user) {
  const schema = Joi.object({
    username: Joi.string() .min(1) .max(50),
    email: Joi.string() .min(1) .max(255) .email(),
    role: Joi.string() .min(1) .max(50),
    age: Joi.string() .min(1) .max(7),
    csp: Joi.string() .min(1) .max(6),
    password: Joi.string() .min(1) .max(255),
    stripeId: Joi.string() .min(0) .max(100)
  });

  return schema.validate(user);
}

export function validateProfessionalCreation(professional) {
  const schema = Joi.object({
    userId: Joi.string() .min(1) .max(255) .required(),
    companyName: Joi.string() .min(1) .max(255) .required(),
    companyAddress: Joi.string() .min(1) .max(255) .required(),
    companyAddress2: Joi.string() .min(0) .max(255),
    billingAddress: Joi.string() .min(1) .max(255) .required(),
    clientNumberTVA: Joi.string() .min(1) .max(255) .required(),
    personalPhone: Joi.string() .min(0) .max(255),
    companyPhone: Joi.string() .min(1) .max(255) .required(),
    RCS: Joi.string() .min(0) .max(255),
    registrationCity: Joi.string() .min(0) .max(255),
    SIREN: Joi.string() .min(0) .max(255),
    SIRET: Joi.string() .min(0) .max(255),
    artisanNumber: Joi.string() .min(0) .max(255),
    type: Joi.string() .min(1) .max(255) .required()
  });

  return schema.validate(professional);
}

export function validateProfessionalUpdate(professional) {
  const schema = Joi.object({
    companyName: Joi.string() .min(1) .max(255),
    companyAddress: Joi.string() .min(1) .max(255),
    companyAddress2: Joi.string() .min(0) .max(255),
    billingAddress: Joi.string() .min(1) .max(255),
    clientNumberTVA: Joi.string() .min(1) .max(255),
    personalPhone: Joi.string() .min(0) .max(255),
    companyPhone: Joi.string() .min(1) .max(255),
    RCS: Joi.string() .min(0) .max(255),
    registrationCity: Joi.string() .min(0) .max(255),
    SIREN: Joi.string() .min(0) .max(255),
    SIRET: Joi.string() .min(0) .max(255),
    artisanNumber: Joi.string() .min(0) .max(255),
    type: Joi.string() .min(1) .max(255)
  });

  return schema.validate(professional);
}

export async function ParamsUserCheck(req, res, next) {
  req.middleware_values = req.params;
  req.middleware_values._id = req.params.id;
  next();
}

export async function ParamsUserCheckV2(req, res, next) {
  const userId = CryptoJS.enc.Base64.parse(req.params.id).toString(CryptoJS.enc.Utf8);

  req.middleware_values = req.params;
  req.middleware_values._id = userId;
  next();
}

export async function ProfessionalInfoUserCheck(req, res, next) {
  const professionalInfo = await ProfessionalInfo.findOne({_id: req.params.id});
  req.middleware_values = professionalInfo;
  req.middleware_values._id = professionalInfo.userId;
  next();
}

export async function AdminOrOwnUser(req, res, next) {
  const usertoken = req.headers.authorization;

  if (usertoken) {
    const token = usertoken.split(' ');
    try {
      const decoded = jwt.verify(token[1], config.dev.publicKEY);
      let user = await User.findOne({_id: decoded._id});

      if (user && (user.role === "admin" || user.id === String(req.middleware_values._id))) {
        req.userId = user.id;
        next();
      } else {
        return res.status(403).json({error: 'You are not allowed to perform this action '});
      }
    } catch (error) {
      return res.status(403).json({error: 'You are not allowed to perform this action'});
    }
  }
}

export async function checkJwt(req, res, next) {
  if (!req.headers.authorization)
    return res.status(401).json({error: 'You need to be logged in to proceed'});
  else {
    const token = String(req.headers.authorization).substring(7);
    req.token = token;
    jwt.verify(token, config.dev.publicKEY, (err) => {
      if (err) {
        return res.status(403).json({error: err});
      } else
        next();
    });
  }
}

export async function generateToken() {
  return await bcrypt.hash(str.random(32), 10);
}

export async function sendResetPasswordEmail(user, token) {
  const transporter = nodemailer.createTransport({
    host: 'in-v3.mailjet.com',
    port: 587,
    auth: {
      user: '067fbf023590a210f21af749b51fb4d9',
      pass: 'd5ee92039cc7e72f0651c2a1847dd55e'
    }
  });

  const salt = await bcrypt.genSalt(10);
  const encryptedId = await bcrypt.hash(String(user._id), salt);

  const mailOptions = {
    from: '"Safely" <safelyfrance@gmail.com>',
    to: user.email,
    subject: 'Reset your account password',
    html: '<h4><b>Reset Password</b></h4>' +
      '<p>To reset your password, click on this link:</p>' +
      '<a href=' + config.clientUrl + '/reset/' + encryptedId + '/token/' + token + '>' + config.clientUrl + '/reset/' + encryptedId + '/token/' + token + '</a>' +
      '<br><br>' +
      '<p>Safely Team</p>'
  }

  try {
    await transporter.sendMail(mailOptions);
    return {status: 200, message: "Email sent!"};
  } catch (err) {
    return {status: 500, message: "An error occurred while sending email"}
  }
}

export async function usersResponder() {
  responder.on('users', async (req, cb) => {
      const users = await User.find({});
      cb(null, users);
  });
}

export async function authResponder() {
  responder.on('owner or admin', async (req, cb) => {
      const usertoken = req.jwt;
      const ownerId = req.ownerId;

      if (usertoken) {
        let token = usertoken.split(' ');
        try {
          const decoded = jwt.verify(token[1], config.dev.publicKEY);
          const user = await User.findOne({_id: decoded._id});
          let right = "false";

          if (user.role === "admin" || user.id === ownerId)
            right = "true";
          
          cb(null, {role: user.role, right:right, userId: user.id});
          return
        } catch {
          cb(null, {role: "empty", right:"false"});
          return
        }
      }
      cb(null, {role: "empty", right:"false"});
  });
}

export async function stripeUserCreationResponder() {
  responder.on('stripeUserCreation', async (req, cb) => {
      const usertoken = req.jwt;
      const stripeId = req.stripeId;


      if (usertoken) {
        let token = usertoken.split(' ');
        try {
          const decoded = jwt.verify(token[1], config.dev.publicKEY);

          User.findByIdAndUpdate({_id: decoded._id}, {stripeId}, (err, user) => {
            if (err) {
              cb(null, {status:"Couldn't Update user"});
              return;
            }
            cb(null, { status:"Stripe Id added" });
            return;
          })
        } catch {
          cb(null, {status:"User not found"});
          return;
        }
      }
      cb(null, { status:"You need to be logged to proceed" });
  });
}

export async function stripeUserInfoResponder() {
  responder.on('stripeUserInfo', async (req, cb) => {
      const usertoken = req.jwt;

      if (usertoken) {
        let token = usertoken.split(' ');
        try {
          const decoded = jwt.verify(token[1], config.dev.publicKEY);
          const user = await User.findOne({_id: decoded._id});
          cb(null, {email: user.email, stripeId: user.stripeId, name: user.username});
          return;
        } catch {
          cb(null, {email: "", stripeId: "", name: ""});
          return;
        }
      }
      cb(null, {email: "", stripeId: "", name: ""});
  });
}

export async function sendLog(logLvl, logContent, logChannels) {
  const request = { type: 'logs', logLvl: logLvl, logService: "Authentification", logContent: logContent, logChannels: logChannels};
  let aa = await requester.send(request)
  return aa;
}
