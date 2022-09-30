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

export function validateAnomalyCreation(anomaly) {
    const schema = Joi.object({
        userId: Joi.string().length(24) .required(),
        comment: Joi.string() .min(1) .max(1000) .required(),
        type: Joi.string().valid('Light', 'Dead End') .required(),
        street: Joi.string() .min(1) .max(255) .required()
    })

    return schema.validate(anomaly);
}

export function validateAnomalyUpdate(anomaly) {
    const schema = Joi.object({
        comment: Joi.string() .min(1) .max(1000),
        type: Joi.string().valid('Light', 'Dead End'),
        street: Joi.string() .min(1) .max(255)
    })

    return schema.validate(anomaly);
}

// userId: req.body.userId,
// comment: req.body.comment,
// type: req.body.type,
// score: req.body.score