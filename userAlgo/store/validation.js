import Joi from "joi";

export function ValidateAlgoPost(Target) {
  const schema = Joi.object({
    targetId: Joi.string() .length(24) .required()
  })
  return schema.validate(Target);
}