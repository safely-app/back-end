import Joi from "joi";

export function validateSafeplaceCreation(safeplace) {
  const schema = Joi.object({
    safeplaceId: Joi.string().length(24),
    name: Joi.string() .min(1) .max(50) .required(),
    decription: Joi.string() .max(500),
    city: Joi.string() .min(1) .max(50) .required(),
    address: Joi.string() .min(1) .max(200) .required(),
    coordinate: Joi.array().items(Joi.string()) .min(2) .max(3),
    dayTimetable: Joi.array().items(Joi.string().allow(null)) .min(7) .max(7) .required(),
    grade: Joi.number() .min(1) .max(5),
    type: Joi.string() .min(1) .max(50) .required()
  })

  return schema.validate(safeplace);
}

export function validateRecurringRouteCreation(recurring) {
  const schema = Joi.object({
    userId: Joi.string().length(24) .required(),
    name: Joi.string() .min(1) .max(50) .required(),
    address: Joi.string() .min(1) .max(200) .required(),
    city: Joi.string() .min(1) .max(50) .required(),
    coordinate: Joi.array().items(Joi.string()) .min(2) .max(3),
  })

  return schema.validate(recurring);
}

export function validateCreateRequestClaimSafeplace(body) {
  const schema = Joi.object({
    userId: Joi.string() .length(24),
    safeplaceId: Joi.string() .length(24),
    safeplaceName: Joi.string() .min(1) .max(50) .required(),
    status: Joi.string() .min(1) .max(25),
    safeplaceDescription: Joi.string() .min(1) .max(500) .required(),
    userComment: Joi.string() .min(1) .max(1000),
    adminComment: Joi.string() .min(1) .max(1000),
    adminId: Joi.string() .length(24),
    coordinate: Joi.array() .required(),
  });

  return schema.validate(body);
}

export function validateUpdateRequestClaimSafeplace(body) {
  const schema = Joi.object({
    userId: Joi.string() .length(24),
    safeplaceId: Joi.string() .length(24),
    safeplaceName: Joi.string() .min(1) .max(50),
    status: Joi.string() .min(1) .max(25),
    safeplaceDescription: Joi.string() .min(1) .max(500),
    userComment: Joi.string() .min(1) .max(1000),
    adminComment: Joi.string() .min(1) .max(1000),
    adminId: Joi.string() .length(24),
    coordinate: Joi.array(),
  });

  return schema.validate(body);
}

export function validateSafeplaceCommentCreation(comment) {
  const schema = Joi.object({
    userId: Joi.string().length(24) .required(),
    safeplaceId: Joi.string().length(24) .required(),
    comment: Joi.string().min(1) .max(1000) .required(),
    grade: Joi.number() .min(1) .max(5) .required(),
  })

  return schema.validate(comment)
}

export function validateSafeplaceCommentModification(comment) {
  const schema = Joi.object({
    comment: Joi.string().min(1) .max(1000),
    grade: Joi.number() .min(1) .max(5),
  })

  return schema.validate(comment)
}

export function validateSafeplaceUpdateHours(safeplace) {
  const schema = Joi.object({
    dayTimetable: Joi.array().items(Joi.string().allow(null).allow('')) .min(7) .max(7) .required()
  })

  return schema.validate(safeplace)
}

export function validateNearest(safeplace) {
  const schema = Joi.object({
    coord: Joi.object({
      latitude: Joi.number() .required(),
      longitude: Joi.number() .required()
    }) .required()
  })

  return schema.validate(safeplace)
}

export function validateTraject(traject) {
  const schema = Joi.object( {
    coordinates : Joi.array().items(Joi.object({
      latitude: Joi.number() .required(),
      longitude: Joi.number() .required()
    })) .required()
  })

  return schema.validate(traject)
}
