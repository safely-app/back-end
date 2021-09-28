import express from 'express';
import _ from "lodash";
import { validateStripeNewProfil, validateStripeLinkCard, validateStripeNewBilling, validateStripeUpdateProfil, validateStripeUpdateBilling } from '../store/validation';

export const StripeController = express.Router();

StripeController.post('/user', async (req, res) => {
    const { error } = validateStripeNewProfil(req.body);

    if (error)
      return res.status(400).json({ error: error.details[0].message});
    let StripeNewUser = _.pick(req.body, [
        'email','name','address', 'description', 'phone']);

    // Faire la création d'un utilisateur Stripe

    console.log("post /user");
    res.status(201).send(StripeNewUser);
});

StripeController.get('/user/:id', async (req, res) => {

    // Faire la laison de la carte et de l'utilisateur sur Stripe

    let stripeUserInfo = [];
    console.log("get /user/:id");
    
    res.status(201).send(stripeUserInfo);
});

StripeController.put('/user/:id', async (req, res) => {
    const { error } = validateStripeUpdateProfil(req.body);

    if (error)
      return res.status(400).json({ error: error.details[0].message});
    let StripeNewDataUser = _.pick(req.body, [
        'email','name','address', 'description', 'phone']);
    // Faire la mise à jours des informations d'un profil sur Stripe

    let stripeUserInfo = [];

    console.log("put /user/:id");

    
    res.status(201).send(stripeUserInfo);
});

StripeController.post('/cardLink', async (req, res) => {
    const { error } = validateStripeLinkCard(req.body);

    if (error)
      return res.status(400).json({ error: error.details[0].message});

    // Faire la laison de la carte et de l'utilisateur sur Stripe
    console.log("post /cardlink");
    let StripeNewUser = []
    res.status(201).send(StripeNewUser);
});

StripeController.post('/billing', async (req, res) => {
    const { error } = validateStripeNewBilling(req.body);

    if (error)
      return res.status(400).json({ error: error.details[0].message});

    // Faire la création du nouveau paiement sur stripe
    console.log("post /billing");

    res.status(201).send("New user created on Stripe");
});

StripeController.get('/billing', async (req, res) => {

    // Faire la laison de la carte et de l'utilisateur sur Stripe

    let billingList = [];
    console.log("get /billing");
    
    res.status(201).send(billingList);
});

StripeController.get('/billing/:id', async (req, res) => {

    // Get the billing by giving the billing id

    let billing = [];
    console.log("get /billing/:id");
    
    res.status(201).send(billing);
});

StripeController.put('/billing/:id', async (req, res) => {
    const { error } = validateStripeUpdateBilling(req.body);

    if (error)
      return res.status(400).json({ error: error.details[0].message});
    // Update the billing by giving the billing id
    console.log("put /billing/:id");

    let billing = [];
    
    res.status(201).send(billing);
});

StripeController.delete('/billing/:id', async (req, res) => {
    // Delete the given billing

    let billing = [];
    console.log("put /billing/:id");
    
    res.status(201).send(billing);
});