import Joi from "joi";

export function validateMarketingTarget(marketingTarget) {
  const schema = Joi.object({
    ownerId: Joi.string() .max(100).required(),
    name: Joi.string() .min(1) .max(50) .required(),
    csp: Joi.string() .min(3) .max(5) .required(),
    ageRange: Joi.string() .min(1) .max(15) .required(),
    interests: Joi.array().items(Joi.string()) .min(0) .max(10)
  })
  return schema.validate(marketingTarget);
}

export function validateCampaign(campaign) {
  const schema = Joi.object({
    ownerId: Joi.string() .max(100).required(),
    name: Joi.string() .min(1) .max(50) .required(),
    budget: Joi.number() .required(),
    status: Joi.string() .min(1) .max(15) .required(),
    startingDate: Joi.date().required(),
    targets: Joi.array().items(Joi.string()) .min(0) .max(10)
  })
  return schema.validate(campaign);
}