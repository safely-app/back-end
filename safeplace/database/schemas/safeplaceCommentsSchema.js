import { Schema } from 'mongoose';

const safeplaceCommentSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  safeplaceId: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  grade: {
    type: Number,
    required: true
  }
}, { timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

export default safeplaceCommentSchema;