import { Schema } from "mongoose";

const pricingSchema = new Schema({
    costType: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50
    },
    price: {
        type: Number,
        required: true,
    },
}, { timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}})

export default pricingSchema;