import { Schema } from 'mongoose';

const supportRequestSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Bug', 'Opinion'],
    required: true
  },
}, { timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

export default supportRequestSchema;