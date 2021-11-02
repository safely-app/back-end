import { Schema } from "mongoose";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 255,
        unique: true
    },
    role: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 10
    },
    password: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 1024
    },
    stripeId: {
        type: String,
        required: false,
        minlength: 0,
        maxlength: 100
    }
}, { timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}})

export default userSchema;