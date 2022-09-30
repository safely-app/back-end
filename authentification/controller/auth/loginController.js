import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import _ from "lodash";
import CryptoJS from "crypto-js";

import User from "../../database/models/userModel";
import { validateLogin, sendLog } from "../../store/utils";
import { config } from "../../store/config";

const LoginController = express.Router();

LoginController.post('/login', async (req, res) => {
    const { error } = validateLogin(req.body);
    if (error) {
        sendLog("Error", `/login ${error}`, "");

        return res.status(400).json({ error: error.details[0].message});
    }

    let user = await User.findOne({ email: req.body.email });
    if (!user) {
        sendLog("Error", `Incorrect email or password`, "");

        return res.status(401).json( { error: 'Incorrect email or password.' });
    }
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
        sendLog("Error", `Incorect email or password`, "");

        return res.status(401).json( { error: 'Incorrect email or password.' });
    }
    user['token'] = jwt.sign({ _id: user._id }, config.dev.privateKEY, {expiresIn: 60*60*2, algorithm: 'RS256'});

    let returnValues = _.pick(user, ['_id', 'email', 'token']);
    returnValues.hashedId =  await CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(user._id.toString()));

    sendLog("Info", `Logged as ${returnValues._id}`, "");

    res.status(200).send(returnValues);
});

export default LoginController;