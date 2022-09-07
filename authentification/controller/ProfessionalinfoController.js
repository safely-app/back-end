import express from "express";
import _ from "lodash";
import CryptoJS from "crypto-js";

import { ProfessionalInfo, User } from "../database/models";
import {
    checkJwt,
    ProfessionalInfoUserCheck,
    AdminOrOwnUser,
    ParamsUserCheck,
    ParamsUserCheckV2,
    validateProfessionalCreation,
    validateProfessionalUpdate
} from "../store/utils";

const ProfessionalController = express.Router();

ProfessionalController.post('/', async (req, res) => {
    const { error } = validateProfessionalCreation(req.body);

    if (error) {
        req.app.locals.log.db.error("ProfessionalInfo Post/", error.details[0].message);
        return res.status(400).json({ error: error.details[0].message});
    }

    const user = await User.findById(req.body.userId);

    if (!user) {
        req.app.locals.log.db.error(`ProfessionalInfo Post/, ${req.body.userId} User is unknown`);
        return res.status(400).json({ error: "User is unknown" });
    }

    if (user.role === "user") {
        const updated = await User.findByIdAndUpdate(user._id, { role: "trader" });

        if (!updated) {
            req.app.locals.log.db.error(`ProfessionalInfo Post/, ${user._id} User role update couldn't proceed`);
            return res.status(403).json({ error: "User role update couldn't proceed" });
        }
    }

    let professional = new ProfessionalInfo(_.pick(req.body, [
        'userId', 'companyName', 'companyAddress', 'companyAddress2',
        'billingAddress', 'clientNumberTVA', 'personalPhone', 'companyPhone',
        'RCS', 'registrationCity', 'SIREN', 'SIRET', 'artisanNumber', 'type']));

    await professional.save();
    professional.hashedId = await CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(professional._id.toString()));
    req.app.locals.log.db.info(`ProfessionalInfo Post/, ${user._id}'s professional info created`);
    res.status(201).send(professional);
});

ProfessionalController.get('/', checkJwt, AdminOrOwnUser, async (req, res) => {
    ProfessionalInfo.find({}, function (err, professional) {
        let professionalMap = [];

        professional.forEach((professional) => {

            const PickedProfessional = _.pick(professional, [
                '_id', 'userId', 'companyName', 'companyAddress', 'companyAddress2',
                'billingAddress', 'clientNumberTVA', 'personalPhone', 'companyPhone',
                'RCS', 'registrationCity', 'SIREN', 'SIRET', 'artisanNumber', 'type']);

            PickedProfessional.hashedId = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(professional._id.toString()));
            professionalMap.push(PickedProfessional);
        });
        if (professionalMap.length > 0) {
            req.app.locals.log.db.info(`"ProfessionalInfo Get/", ${professionalMap[0].userId} get his professional infos`);
        }
        res.status(200).send(professionalMap);
    });
});

ProfessionalController.get('/owner/:id', checkJwt, ParamsUserCheck, AdminOrOwnUser, async (req, res) => {
    let professional = await ProfessionalInfo.findOne({ userId: req.params.id });

    console.log(req.params.id);

    if (professional) {
        const PickedProfessional = _.pick(professional, [
            '_id', 'userId', 'companyName', 'companyAddress', 'companyAddress2',
            'billingAddress', 'clientNumberTVA', 'personalPhone', 'companyPhone',
            'RCS', 'registrationCity', 'SIREN', 'SIRET', 'artisanNumber', 'type']);
        req.app.locals.log.db.info(`"ProfessionalInfo Get/owner/:id", ${PickedProfessional.userId} get his professional infos`);
        res.send(PickedProfessional);
    } else {
        req.app.locals.log.db.error(`ProfessionalInfo Get/owner/:id, couldn't get his professional infos`);
        res.status(404).json({ error: "Professional not found" });
    }
});

ProfessionalController.get('v2/owner/:id', checkJwt, ParamsUserCheckV2, AdminOrOwnUser, async (req, res) => {
    const userId = await CryptoJS.enc.Base64.parse(req.params.id).toString(CryptoJS.enc.Utf8);
    let professional = await ProfessionalInfo.findOne({ userId: userId });

    if (professional) {
        const PickedProfessional = _.pick(professional, [
            '_id', 'userId', 'companyName', 'companyAddress', 'companyAddess2',
            'billingAddress', 'clientNumberTVA', 'personalPhone', 'companyPhone',
            'RCS', 'registrationCity', 'SIREN', 'SIRET', 'artisanNumber', 'type']);
        req.app.locals.log.db.info(`"ProfessionalInfo Get v2/owner/:id", ${PickedProfessional.userId} get his professional infos`);

        PickedProfessional.hashedId = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(professional._id.toString()));
        res.send(PickedProfessional);
    } else {
        req.app.locals.log.db.error(`"ProfessionalInfo Get v2/owner/:id", couldn't get his professional infos`);
        res.status(404).json({ error: "Professional not found" });
    }
});

ProfessionalController.get('/:id', checkJwt, ProfessionalInfoUserCheck, AdminOrOwnUser, async (req, res) => {
    let professional = await ProfessionalInfo.findOne({ _id: req.params.id });

    if (professional) {
        const PickedProfessional = _.pick(professional, [
            '_id', 'userId', 'companyName', 'companyAddress', 'companyAddress2',
            'billingAddress', 'clientNumberTVA', 'personalPhone', 'companyPhone',
            'RCS', 'registrationCity', 'SIREN', 'SIRET', 'artisanNumber', 'type']);

        req.app.locals.log.db.info(`"ProfessionalInfo Get/:id", ${PickedProfessional.userId} get his professional infos`);
        res.send(PickedProfessional);
    } else {
        req.app.locals.log.db.error(`"ProfessionalInfo Get/:id", couldn't get his professional infos`);
        res.status(404).json({ error: "Professional not found" });
    }
});

ProfessionalController.get('v2/:id', checkJwt, ProfessionalInfoUserCheck, AdminOrOwnUser, async (req, res) => {
    const professionalId = await CryptoJS.enc.Base64.parse(req.params.id).toString(CryptoJS.enc.Utf8);
    let professional = await ProfessionalInfo.findOne({ _id: professionalId });

    if (professional) {
        const PickedProfessional = _.pick(professional, [
            '_id', 'userId', 'companyName', 'companyAddress', 'companyAddess2',
            'billingAddress', 'clientNumberTVA', 'personalPhone', 'companyPhone',
            'RCS', 'registrationCity', 'SIREN', 'SIRET', 'artisanNumber', 'type']);

        PickedProfessional.hashedId = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(professional._id.toString()));
        req.app.locals.log.db.info(`"ProfessionalInfo Get v2/:id", ${PickedProfessional.userId} get his professional infos`);
        res.send(PickedProfessional);
    } else {
        req.app.locals.log.db.error(`"ProfessionalInfo Get v2/:id", couldn't get his professional infos`);
        res.status(404).json({ error: "Professional not found" });
    }
});

ProfessionalController.put('/:id', checkJwt, ProfessionalInfoUserCheck, AdminOrOwnUser, async (req, res) => {
    const { error } = validateProfessionalUpdate(req.body);

    if (error) {
        req.app.locals.log.db.error(`"ProfessionalInfo Put/:id", ${req.params.id} `, error.details[0].message);
        return res.status(400).json({ error: error.details[0].message});
    }

    const newBody = req.body;

    if (newBody._id)
        delete newBody._id

    ProfessionalInfo.findByIdAndUpdate(req.params.id, newBody, (err) => {
        if (err) {
            req.app.locals.log.db.error(`"ProfessionalInfo Put/:id", ${req.params.id}'Update couldn\'t be proceed' `);
            return res.status(403).json({ error: 'Update couldn\'t be proceed' })
        }
        req.app.locals.log.db.info(`"ProfessionalInfo Put/:id", ${req.params.id}'Updated ! `);
        return res.status(200).json({ success: 'Updated!' })
    })
});

ProfessionalController.put('v2/:id', checkJwt, ProfessionalInfoUserCheck, AdminOrOwnUser, async (req, res) => {
    const professionalId = await CryptoJS.enc.Base64.parse(req.params.id).toString(CryptoJS.enc.Utf8);
    const newBody = req.body;

    if (newBody._id)
        delete newBody._id

    ProfessionalInfo.findByIdAndUpdate(professionalId, newBody, (err) => {
        if (err) {
            req.app.locals.log.db.info(`"ProfessionalInfo Put/:id", ${req.params.id}'Update couldn\'t be proceed' `);
            return res.status(403).json({ error: 'Update couldn\'t be proceed' })
        }
        req.app.locals.log.db.info(`"ProfessionalInfo Put/:id", ${req.params.id}'Update couldn\'t be proceed' `);
        return res.status(200).json({ success: 'Updated!' })
    })
});

ProfessionalController.delete('/:id', checkJwt, ProfessionalInfoUserCheck, AdminOrOwnUser, async (req, res) => {
    ProfessionalInfo.deleteOne({ _id: req.params.id })
        .then(() => {
            req.app.locals.log.db.info(`"ProfessionalInfo Put/:id", ${req.params.id} 'Professional deleted !' `);
            res.status(200).json({ message: 'Professional deleted !' });
        })
        .catch((error) => {
            req.app.locals.log.db.info(`"ProfessionalInfo Put/:id", ${req.params.id} ${error} `);
            res.status(400).json({ error: error });
        });
});

ProfessionalController.delete('v2/:id', checkJwt, ProfessionalInfoUserCheck, AdminOrOwnUser, async (req, res) => {
    const professionalId = await CryptoJS.enc.Base64.parse(req.params.id).toString(CryptoJS.enc.Utf8);

    ProfessionalInfo.deleteOne({ _id: professionalId })
        .then(() => {
            req.app.locals.log.db.info(`"ProfessionalInfo Put/:id", ${req.params.id} 'Professional deleted !' `);
            res.status(200).json({ message: 'Professional deleted !' });
        })
        .catch((error) => {
            req.app.locals.log.db.info(`"ProfessionalInfo Put/:id", ${req.params.id} ${error} `);
            res.status(400).json({ error: error });
        });
});

export default ProfessionalController;
