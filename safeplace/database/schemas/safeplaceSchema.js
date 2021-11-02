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
  decription: {
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
  }
}, { timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

export default safeplaceSchema;