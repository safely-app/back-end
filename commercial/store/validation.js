import Joi from "joi";

export function putValidateMarketingTarget(marketingTarget) {
  const schema = Joi.object({
    ownerId: Joi.string() .length(24),
    name: Joi.string() .min(1) .max(50),
    csp: Joi.string() .min(3) .max(5),
    ageRange: Joi.string() .min(1) .max(15),
    interests: Joi.array().items(Joi.string()) .min(0) .max(10)
  })
  return schema.validate(marketingTarget);
}

export function validateMarketingTarget(marketingTarget) {
  const schema = Joi.object({
    ownerId: Joi.string() .length(24).required(),
    name: Joi.string() .min(1) .max(50) .required(),
    csp: Joi.string() .min(3) .max(5) .required(),
    ageRange: Joi.string() .min(1) .max(15) .required(),
    interests: Joi.array().items(Joi.string()) .min(0) .max(10)
  })
  return schema.validate(marketingTarget);
}

export function putValidateCampaign(campaign) {
  const schema = Joi.object({
    ownerId: Joi.string() .length(24),
    name: Joi.string() .min(1) .max(50),
    budget: Joi.number(),
    status: Joi.string() .min(1) .max(15),
    startingDate: Joi.date(),
    targets: Joi.array().items(Joi.string()) .min(0) .max(10)
  })
  return schema.validate(campaign);
}

export function validateCampaign(campaign) {
  const schema = Joi.object({
    ownerId: Joi.string() .length(24).required(),
    name: Joi.string() .min(1) .max(50) .required(),
    budget: Joi.number() .required(),
    status: Joi.string() .min(1) .max(15) .required(),
    startingDate: Joi.date().required(),
    targets: Joi.array().items(Joi.string()) .min(0) .max(10)
  })
  return schema.validate(campaign);
}

export function putValidateAdvertising(campaign) {
  const schema = Joi.object({
    ownerId: Joi.string() .length(24),
    title: Joi.string() .min(1) .max(25),
    description: Joi.string() .min(1) .max(255),
    imageUrl: Joi.string() .min(1) .max(255),
    targetType: Joi.array().items(Joi.string()) .min(0) .max(10),
  })
  return schema.validate(campaign);
}

export function validateAdvertising(campaign) {
  const schema = Joi.object({
    ownerId: Joi.string() .length(24).required(),
    title: Joi.string() .min(1) .max(25) .required(),
    description: Joi.string() .min(1) .max(255) .required(),
    imageUrl: Joi.string() .min(1) .max(255) .required(),
    targetType: Joi.array().items(Joi.string()) .min(0) .max(10) .required()
  })
  return schema.validate(campaign);
}