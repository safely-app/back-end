import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import _ from "lodash";
import CryptoJS from "crypto-js";

import User from "../../database/models/userModel";
import { validateRegister } from "../../store/utils";
import { config } from "./../../store/config";

const RegisterController = express.Router();

RegisterController.post('/register', async (req, res) => {
    const {error} = validateRegister(req.body);

    if (error)
        return res.status(400).json( { error: error.details[0].message });

    let user = await User.findOne({ email: req.body.email });
    if (user) {
        return res.status(401).json( { error: 'That user already exist !' });
    } else {
        user = new User(_.pick(req.body, ['username', 'email', 'password']));
        user['role'] = 'user';
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        user['token'] = jwt.sign({ _id: user._id }, config.dev.privateKEY, {expiresIn: 60*60*2, algorithm: 'RS256'});

        await user.save();

        let returnValues = _.pick(user, ['_id', 'username', 'email', 'token']);
        returnValues.hashedId =  await CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(user._id.toString()));

        res.status(201).send(returnValues);
    }
});

export default RegisterController;