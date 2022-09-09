import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import _ from "lodash";
import CryptoJS from "crypto-js";

import { User } from "../database/models";
import {
    checkJwt,
    generateToken,
    sendResetPasswordEmail,
    validateChangePassword,
    validateUpdateUser,
    ParamsUserCheck,
    AdminOrOwnUser
} from "../store/utils";
import { config } from "../store/config";
import {ResetPassword} from "../database/models";

const UserController = express.Router();

UserController.get('/' , checkJwt, AdminOrOwnUser, async (req, res) => {
    User.find({}, function(err, users) {
        let userMap = [];

        users.forEach((user) => {
            const noPasswordUser = _.pick(user, [
                '_id', 'username','email','role',
                'createdAt', 'updatedAt']);
            noPasswordUser.hashedId = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(user._id.toString()));
            userMap.push(noPasswordUser);
        });
        req.app.locals.log.db.info(`${req.userId} User Get/ get all users`);
        res.status(200).send(userMap);
    });
});

UserController.get('/:id', checkJwt, ParamsUserCheck, AdminOrOwnUser, async (req, res) => {
    let user = await User.findOne({ _id: req.params.id });

    if (user) {
        const noPasswordUser = _.pick(user, [
            '_id', 'username','email','role', 'stripeId',
            'age', 'csp', 'createdAt', 'updatedAt']);
        req.app.locals.log.db.info(`${req.userId} User Get/:id get ${req.params.id}`);
        res.send(noPasswordUser);
    } else {
        req.app.locals.log.db.error(`${req.userId} User Get/:id User not found`);
        res.status(404).json({error: "User not found"});
    }
});

UserController.get('v2/:id', checkJwt, ParamsUserCheck, AdminOrOwnUser, async (req, res) => {
    const userId = await CryptoJS.enc.Base64.parse(req.params.id).toString(CryptoJS.enc.Utf8);
    let user = await User.findOne({ _id: userId });

    if (user) {
        const noPasswordUser = _.pick(user, [
            'username','email','role',
            'createdAt', 'updatedAt']);

        noPasswordUser.hashedId = await CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(user._id.toString()));
        req.app.locals.log.db.info(`${req.userId} User Get v2/:id get ${req.params.id}`);
        res.send(noPasswordUser);
    } else {
        req.app.locals.log.db.error(`${req.userId} User Get v2/:id User not found`);
        res.status(404).json({error: "User not found"});
    }
});

UserController.put('/:id', checkJwt, ParamsUserCheck, AdminOrOwnUser, async (req, res)=> {
    const token = req.token;

    const { error } = validateUpdateUser(req.body);
    if (error) {
        req.app.locals.log.db.error(`${req.userId} User Put/:id`, error.details[0].message);
        return res.status(403).json({ error: error.details[0].message});
    }

    try {
        const decoded = jwt.verify(token, config.dev.publicKEY);
        const salt = await bcrypt.genSalt(10);

        let user = await User.findOne({_id: decoded._id});

        const newBody = req.body;

        if (req.body.role && user.role !== "admin")
            delete newBody.role
        if (newBody.password)
            newBody.password = await bcrypt.hash(newBody.password, salt)

        User.findByIdAndUpdate(req.params.id, newBody, (err, user) => {
            if (err) {
                req.app.locals.log.db.error(`${req.userId} User Put/:id Update couldn\'t be proceed`);
                return res.status(403).json({error: 'Update couldn\'t be proceed'})
            }
            req.app.locals.log.db.info(`${req.userId} User Put/:id Updated !`);
            return res.status(200).json({success: 'Updated!'})
        })
    } catch {
        req.app.locals.log.db.error(`${req.userId} User Put/:id You need to be logged as an admin or request for your profil`);
        return res.status(403).json({error: 'You need to be logged as an admin or request for your profil '});
    }
});

UserController.put('v2/:id', checkJwt, ParamsUserCheck, AdminOrOwnUser, async (req, res)=> {
    const token = req.token;

        const { error } = validateUpdateUser(req.body);
        if (error) {
            req.app.locals.log.db.error(`${req.userId} User v2 Put/:id`, error.details[0].message);
            return res.status(403).json({ error: error.details[0].message});
        }

    try {
        const userId = await CryptoJS.enc.Base64.parse(req.params.id).toString(CryptoJS.enc.Utf8);
        const decoded = jwt.verify(token, config.dev.publicKEY);
        const salt = await bcrypt.genSalt(10);
    
        let user = await User.findOne({_id: decoded._id});
    
        const newBody = req.body;

        if (req.body.role && user.role !== "admin")
          delete newBody.role
        if (newBody.password)
          newBody.password = await bcrypt.hash(newBody.password, salt)
        
        User.findByIdAndUpdate(userId, newBody, (err, user) => {
            if (err) {
                req.app.locals.log.db.error(`${req.userId} User v2 Put/:id Update couldn\'t be proceed`);
                return res.status(403).json({error: 'Update couldn\'t be proceed'})
            }
            req.app.locals.log.db.info(`${req.userId} User v2 Put/:id Updated !`);
            return res.status(200).json({success: 'Updated!'})
        })
    } catch {
        req.app.locals.log.db.error(`${req.userId} User v2 Put/:id You need to be logged as an admin or request for your profil`);
        return res.status(403).json({error: 'You need to be logged as an admin or request for your profil '});
    }
});

UserController.delete('/:id', checkJwt, ParamsUserCheck, AdminOrOwnUser, async (req, res) => {
    User.deleteOne({_id: req.params.id})
      .then(()=> {
            req.app.locals.log.db.info(`${req.userId} User Delete/:id User deleted !`);
            res.status(200).json({ message: 'User deleted !' });
      })
      .catch( (error) => {
            req.app.locals.log.db.error(`${req.userId} User Delete/:id`, error);
            res.status(400).json({ error: error });
      });
});

UserController.delete('v2/:id', checkJwt, ParamsUserCheck, AdminOrOwnUser, async (req, res) => {
    const userId = await CryptoJS.enc.Base64.parse(req.params.id).toString(CryptoJS.enc.Utf8);

    User.deleteOne({_id: userId})
        .then(()=> {
            req.app.locals.log.db.info(`${req.userId} User v2 Delete/:id User deleted !`);
            res.status(200).json({ message: 'User deleted !' });
        })
        .catch( (error) => {
            req.app.locals.log.db.error(`${req.userId} User v2 Delete/:id`, error);
            res.status(400).json({ error: error });
        });
});

UserController.post('/forgotPassword', async (req, res) => {
    const email = req.body.email

    if (email) {
        User.findOne({email: email})
          .then(async (user) => {
              if (user) {
                  let token = undefined;
                  let index = 0;

                  do {
                      token = await generateToken();
                      index++;
                  } while (await ResetPassword.findOne({ resetPasswordToken: token }) && index < 100)
                  if (index >= 100)
                      res.status(500).json({message: "An error occurred"});

                  let expireDate = new Date();
                  expireDate.setMinutes(expireDate.getMinutes() + 30);
                  const resetPassword = new ResetPassword({
                      userId: user._id,
                      resetPasswordToken: token,
                      expire: expireDate
                  })
                  await resetPassword.save();

                  const result = await sendResetPasswordEmail(user, token);

                  res.status(result.status).json({ message: result.message });
              } else
                  return res.status(404).json({error: "User not found."})
          })
    } else
        return res.status(400).json({error: 'You need to send an email to this route.'})
})

UserController.post('/changePassword', async (req, res) => {
    const {error} = validateChangePassword(req.body);

    if (error)
        return res.status(400).json( { error: error.details[0].message });

    const salt = await bcrypt.genSalt(10);
    const userId = req.body.userId;
    const token = req.body.token;
    const password = await bcrypt.hash(req.body.password, salt);
    const resetPassword = await ResetPassword.findOne({ resetPasswordToken: token });

        if (resetPassword) {
            if (await bcrypt.compare(resetPassword.userId, userId)) {
                if (await User.updateOne({ _id: resetPassword.userId }, { password: password }))
                    res.status(200).json({ message: "Password updated!" });
                else
                    res.status(500).json({ error: "Password update failed" });
            } else
                res.status(400).json({ error: "Wrong Id" });
        } else
            res.status(400).json({ error: "This token doesn't exist" });
})

export default UserController;
