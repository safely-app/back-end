import express from 'express';

import { Safeplace } from "../database/models";
import { sendTimetableVerificationEmail } from "../store/utils"
import { requestAuth } from "../store/middleware";

export const MailingController = express.Router();

MailingController.get("/", async (req, res) => {
    if (req.authResponse.role !== 'admin')
        return res.status(401).json({message: "Unauthorized"});

    const safeplaces = await Safeplace.find({ "email": { $exists: true } });

    for (const index in safeplaces) {
        await sendTimetableVerificationEmail(safeplaces[index].email, safeplaces[index]._id);
    }

    return res.status(200).json({message: "Mails sent"});
})
