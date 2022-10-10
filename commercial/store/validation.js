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
    targets: Joi.array().items(Joi.string()) .min(0) .max(10),
    safeplaceId: Joi.string() .length(24)
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
    targets: Joi.array().items(Joi.string()) .min(0) .max(10),
    safeplaceId: Joi.string() .length(24)
  })
  return schema.validate(campaign);
}

export function putValidateAdvertising(campaign) {
  const schema = Joi.object({
    ownerId: Joi.string() .length(24),
    campaignId: Joi.string() .length(24),
    title: Joi.string() .min(1) .max(25),
    description: Joi.string() .min(1) .max(255),
    imageUrl: Joi.string() .min(1) .max(255),
    targetType: Joi.array().items(Joi.string()) .min(0) .max(10),
  })
  return schema.validate(campaign);
}

export function validateAdvertising(campaign) {
  const schema = Joi.object({
    ownerId: Joi.string() .length(24) .required(),
    campaignId: Joi.string() .length(24) .required(),
    title: Joi.string() .min(1) .max(25) .required(),
    description: Joi.string() .min(1) .max(255) .required(),
    imageUrl: Joi.string() .min(1) .max(255) .required(),
    targetType: Joi.array().items(Joi.string()) .min(0) .max(10) .required()
  })
  return schema.validate(campaign);
}

export function putValidateNotifications(campaign) {
  const schema = Joi.object({
    ownerId: Joi.string() .length(24),
    title: Joi.string() .min(1) .max(25),
    description: Joi.string() .min(1) .max(255),
  })
  return schema.validate(campaign);
}

export function validateNotifications(campaign) {
  const schema = Joi.object({
    ownerId: Joi.string() .length(24).required(),
    title: Joi.string() .min(1) .max(25) .required(),
    description: Joi.string() .min(1) .max(255) .required(),
  })
  return schema.validate(campaign);
}

export function putValidateModif(campaign) {
  const schema = Joi.object({
    safeplaceId: Joi.string().length(24),
    name: Joi.string() .min(1) .max(50),
    description: Joi.string() .max(500),
    city: Joi.string() .min(1) .max(50),
    address: Joi.string() .min(1) .max(200),
    coordinate: Joi.array().items(Joi.string()) .min(2) .max(3),
    dayTimetable: Joi.array().items(Joi.string().allow(null)) .min(7) .max(7),
    grade: Joi.number() .min(1) .max(5),
    type: Joi.string() .min(1) .max(50)
  })
  return schema.validate(campaign);
}

export function validateModif(campaign) {
  const schema = Joi.object({
    safeplaceId: Joi.string().length(24) .required(),
    name: Joi.string() .min(1) .max(50),
    description: Joi.string() .max(500),
    city: Joi.string() .min(1) .max(50),
    address: Joi.string() .min(1) .max(200),
    coordinate: Joi.array().items(Joi.string()) .min(2) .max(3),
    dayTimetable: Joi.array().items(Joi.string().allow(null)) .min(7) .max(7),
    grade: Joi.number() .min(1) .max(5),
    type: Joi.string() .min(1) .max(50)
  })
  return schema.validate(campaign);
}