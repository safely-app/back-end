import { Schema } from "mongoose";

const requestClaimSafeplaceSchema = new Schema({
  userId: {
    type: String,
    required: false
  },
  safeplaceId: {
    type: String,
    required: false
  },
  safeplaceName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  adminComment: {
    type: String,
    required: false
  },
  safeplaceDescription: {
    type: String,
    required: true
  },
  coordinate: {
    type: Array,
    required: true
  },
  adminId: {
    type: String,
    required: false
  },
  userComment: {
    type: String,
    required: false
  }
}, { timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

export default requestClaimSafeplaceSchema;