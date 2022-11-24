import { Schema } from 'mongoose';

const safeplaceSchema = new Schema({
  safeplaceId: {
    type: String,
  },
  ownerId: {
    type: String,
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
  },
  city: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  coordinate: {
    type: [String]
  },
  dayTimetable: {
    type: [String],
    required: true
  },
  grade: {
    type: Number,
  },
  type: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  phone: {
    type: String
  },
  web: {
    type: String
  },
  adminComment: {
    type: String
  },
  adminGrade: {
    type: Number
  }
}, { timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

export default safeplaceSchema;
