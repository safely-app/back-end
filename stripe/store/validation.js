import Joi from "joi";

export function validateStripeDefaultCard(CardAndUser) {
	const schema = Joi.object({
	  id: Joi.string() .min(1) .max(50) .required(),
	  customer: Joi.string() .min(1) .max(50) .required(),
	})
	return schema.validate(CardAndUser);
  }

export function validateStripeLinkCard(CardAndUser) {
  const schema = Joi.object({
    cardId: Joi.string() .min(1) .max(50) .required(),
  })
  return schema.validate(CardAndUser);
}

export function validateStripeNewBilling(BillingInformation) {
  const schema = Joi.object({
    amount: Joi.number() .required(),
  })
  return schema.validate(BillingInformation);
}

export function validateStripeUpdateProfil(BillingInformation) {
  const schema = Joi.object({
    email: Joi.string() .min(3) .max(50) .email(),
    username: Joi.string() .min(2) .max(50),
    description: Joi.string() .min(5) .max(500)
  })
  return schema.validate(BillingInformation);
}

export function validateStripeUpdateBilling(BillingInformation) {
  const schema = Joi.object({
    stripeId: Joi.string() .min(1) .max(50),
    description: Joi.string() .min(1) .max(500),
    receipt_email: Joi.string() .min(1) .max(50) .email()
  })
  return schema.validate(BillingInformation);
}

export function validateStripeSubscription(BillingInformation) {
  const schema = Joi.object({
    subscription: Joi.string().valid('weekly', 'monthly')
  })
  return schema.validate(BillingInformation);
}