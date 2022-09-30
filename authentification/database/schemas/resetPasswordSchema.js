import { Schema } from "mongoose";

const resetPasswordSchema = new Schema({
    userId: {
      type: String,
      required: true
    },
    resetPasswordToken: {
      type: String,
      required: true
    },
    expire: {
      type: Date,
      required: true
    }
});

export default resetPasswordSchema;