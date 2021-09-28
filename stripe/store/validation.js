import Joi from "joi";

export function validateStripeNewProfil(StripeProfil) {
  const schema = Joi.object({
    email: Joi.string() .min(3) .max(50) .email() .required(),
    name: Joi.string() .min(2) .max(50) .required(),
    address: Joi.string() .min(5) .max(500),
    phone: Joi.string() .min(4) .max(15),
    description: Joi.string() .min(5) .max(500) .required()
  })
  return schema.validate(StripeProfil);
}

export function validateStripeLinkCard(CardAndUser) {
  const schema = Joi.object({
    cardId: Joi.string() .length(24) .required(),
    stripeId: Joi.string() .length(24) .required()
  })
  return schema.validate(CardAndUser);
}

export function validateStripeNewBilling(BillingInformation) {
  const schema = Joi.object({
    amount: Joi.number() .required(),
    currency: Joi.string() .min(1) .max(10) .required(),
    stripeId: Joi.string() .length(24) .required(),
    description: Joi.string() .min(1) .max(500) .required(),
    receipt_email: Joi.string() .min(1) .max(50) .email() .required()
  })
  return schema.validate(BillingInformation);
}

export function validateStripeUpdateProfil(BillingInformation) {
  const schema = Joi.object({
    email: Joi.string() .min(3) .max(50) .email(),
    name: Joi.string() .min(2) .max(50),
    address: Joi.string() .min(5) .max(500),
    phone: Joi.string() .min(4) .max(15),
    description: Joi.string() .min(5) .max(500)
  })
  return schema.validate(BillingInformation);
}

export function validateStripeUpdateBilling(BillingInformation) {
  const schema = Joi.object({
    amount: Joi.number(),
    currency: Joi.string() .min(1) .max(10),
    stripeId: Joi.string() .length(24),
    description: Joi.string() .min(1) .max(500),
    receipt_email: Joi.string() .min(1) .max(50) .email()
  })
  return schema.validate(BillingInformation);
}