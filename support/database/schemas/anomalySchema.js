import { Schema } from 'mongoose';

const anomalySchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Light', 'Dead End'],
    required: true
  },
  score: {
    type: Number,
    min: 0,
    required: true
  },
  street: {
    type: String,
    required: true
  }
}, { timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

export default anomalySchema;