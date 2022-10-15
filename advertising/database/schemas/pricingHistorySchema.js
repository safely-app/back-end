import { Schema } from "mongoose";

const pricingHistorySchema = new Schema({
    campaignId: {
        type: String,
        required: true
    },
    eventType: {
        type: String,
        required: true
    },
    userAge : {
        type : String,
        required : false
    },
    userCsp : {
        type : String,
        required : false
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