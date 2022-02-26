import Joi from "joi";

export function validateSupportRequestCreation(support) {
    const schema = Joi.object({
        userId: Joi.string().length(24) .required(),
        title: Joi.string() .min(1) .max(100) .required(),
        comment: Joi.string() .min(1) .max(1000) .required(),
        type: Joi.string().valid('Bug', 'Opinion') .required()
    })

    return schema.validate(support);
}

export function validateSupportRequestUpdate(support) {
    const schema = Joi.object({
        title: Joi.string() .min(1) .max(100),
        comment: Joi.string() .min(1) .max(1000),
        type: Joi.string().valid('Bug', 'Opinion')
    })

    return schema.validate(support);
}