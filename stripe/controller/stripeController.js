import express from 'express';
import stripe from 'stripe';
import dotenv from 'dotenv';
import _ from "lodash";
import { validateStripeLinkCard, validateStripeNewBilling, validateStripeUpdateProfil, validateStripeUpdateBilling, validateStripeSubscription } from '../store/validation';
import { stripeUserCreation, stripeUserInfo, requestAuth } from '../store/middleware'

export const StripeController = express.Router();
const Stripe = stripe(dotenv.config().parsed.STRIPE_KEY);

StripeController.post('/user', requestAuth, async (req, res) => {
    // try {

    // } catch (error) {
    //   return res.status(403).json({error: error});
    // }
    try {
      const userInfo = await stripeUserInfo(req.headers.authorization);
      const customer = await Stripe.customers.create({
          email: userInfo.email,
          description: "New User",
          name: userInfo.name
      });
      stripeUserCreation(req.headers.authorization, customer.id)
      res.status(201).send(customer);
    } catch (error) {
      return res.status(403).json({error: error});
    }
});

StripeController.get('/user/:id', requestAuth, async (req, res) => {
  try {
    const customer = await Stripe.customers.retrieve(
        req.params.id
      );

    res.status(201).send(customer);
  } catch (error) {
    return res.status(403).json({error: error});
  }
});

StripeController.put('/user/:id', requestAuth, async (req, res) => {
  try {
    const { error } = validateStripeUpdateProfil(req.body);

    if (error)
      return res.status(400).json({ error: error.details[0].message});

    const customer = await Stripe.customers.update(
        req.params.id,
        {
            email: req.body.email,
            name: req.body.username,
            description: req.body.description
        }
      );
    res.status(201).send(customer);
  } catch (error) {
    return res.status(403).json({error: error});
  }
});

StripeController.post('/cardLink', requestAuth, async (req, res) => {
  try {
    const { error } = validateStripeLinkCard(req.body);

    if (error)
      return res.status(400).json({ error: error.details[0].message});
    const userInfo = await stripeUserInfo(req.headers.authorization);
    const paymentMethod = await Stripe.paymentMethods.attach(
        req.body.cardId,
        {customer: userInfo.stripeId}
      );
    await Stripe.customers.update(
        userInfo.stripeId,
        {
            invoice_settings: {default_payment_method: req.body.cardId}
        }
      );
    res.status(201).send(paymentMethod);
  } catch (error) {
    return res.status(403).json({error: error});
  }
});

StripeController.post('/billing', requestAuth, async (req, res) => {
  try {
    const { error } = validateStripeNewBilling(req.body);

    if (error)
      return res.status(400).json({ error: error.details[0].message});
    const userInfo = await stripeUserInfo(req.headers.authorization);

    const customer = await Stripe.customers.retrieve(
        userInfo.stripeId
    );

    const paymentIntent = await Stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: "eur",
      customer: userInfo.stripeId,
      description: "New billing",
      receipt_email: userInfo.email,
      payment_method: customer.invoice_settings.default_payment_method,
      confirm: true
    });

    res.status(201).send(paymentIntent);
  } catch (error) {
    return res.status(403).json({error: error});
  }
});

StripeController.get('/billing', requestAuth, async (req, res) => {
  try {
    const charges = await Stripe.paymentIntents.list({
        limit: 50,
      });
    
    res.status(201).send(charges);
  } catch (error) {
    return res.status(403).json({error: error});
  }
});

StripeController.get('/billing/:id', requestAuth, async (req, res) => {
  try {
    const charge = await Stripe.paymentIntents.retrieve(
        req.params.id
      );
    
    res.status(201).send(charge);
  } catch (error) {
    return res.status(403).json({error: error});
  }
});

StripeController.get('/billingUser/:id', requestAuth, async (req, res) => {
  try {
  const charges = await Stripe.paymentIntents.list({
    limit: 50,
    customer: req.params.id
  });
  
  res.status(201).send(charges);
} catch (error) {
  return res.status(403).json({error: error});
}
});

StripeController.put('/billing/:id', requestAuth, async (req, res) => {
  try {
    const { error } = validateStripeUpdateBilling(req.body);

    if (error)
      return res.status(400).json({ error: error.details[0].message});
    const charge = await Stripe.paymentIntents.update(
        req.params.id,
        {
            customer: req.body.stripeId,
            description: req.body.description,
            receipt_email: req.body.receipt_email
        }
    );
    
    res.status(201).send(charge);
  } catch (error) {
    return res.status(403).json({error: error});
  }
});

StripeController.post('/subscription', requestAuth, async (req, res) => {
  try {
    const { error } = validateStripeSubscription(req.body);

      if (error)
        return res.status(400).json({ error: error.details[0].message});

    const userInfo = await stripeUserInfo(req.headers.authorization);
    const customer = await Stripe.customers.retrieve(
      userInfo.stripeId
    );

    let subscription_ = ""
    if (req.body.subscription === "weekly")
      subscription_ = "price_1JfMOMBVXYxPaZELLdQWNMjR"
    else if (req.body.subscription === "monthly")
      subscription_ = "price_1JfMOnBVXYxPaZELJiSl9ROP"
      
    const subscription = await Stripe.subscriptions.create({
      customer: userInfo.stripeId,
      default_payment_method: customer.invoice_settings.default_payment_method,
      items: [
        {price: subscription_},
      ],
    });
    res.status(201).send(subscription);
  } catch (error) {
    return res.status(403).json({error: error});
}
});

StripeController.get('/subscription', requestAuth, async (req, res) => {
  try {
    const subscriptions = await Stripe.subscriptions.list({
      limit: 50,
    });
    res.status(201).send(subscriptions);
  } catch (error) {
    return res.status(403).json({error: error});
  }
});

StripeController.get('/subscription/:id', requestAuth, async (req, res) => {
  try {
    const subscription = await Stripe.subscriptions.retrieve(
      req.params.id
    );
    res.status(201).send(subscription);
  } catch (error) {
    return res.status(403).json({error: error});
  }
});

StripeController.get('/subscriptionUser/:id', requestAuth, async (req, res) => {
  try {
    const subscriptions = await Stripe.subscriptions.list({
      limit: 50,
      customer: req.params.id
    });
    res.status(201).send(subscriptions);
  } catch (error) {
    return res.status(403).json({error: error});
  }
});

StripeController.delete('/subscription/:id', requestAuth, async (req, res) => {
  try {
    const deleted = await Stripe.subscriptions.del(
      req.params.id
    );
    res.status(201).send(deleted);
  } catch (error) {
    return res.status(403).json({error: error});
  }
});