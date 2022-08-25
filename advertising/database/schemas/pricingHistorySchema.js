import { Schema } from "mongoose";

const pricingHistorySchema = new Schema({
    eventType: {
        type: String,
        required: true
    },
    userAge : {
        type : String,
        required : true
    },
    userCsp : {
        type : String,
        required : true
    },
    eventCost : {
        type : Number,
        required : true
    },
    totalCost : {
        type : Number,
        required : true
    },
    matchingOn : {
        type : [String],
        enum: ['none', 'age', 'csp'],
        required : true
    }
}, { timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}})

export default pricingHistorySchema;