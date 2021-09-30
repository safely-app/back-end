import Joi from "joi";

export function validateEmpty(marketingTarget) {
  const schema = Joi.object({
    empty: Joi.string() .min(0) .max(10)
  })
  return schema.validate(marketingTarget);
}