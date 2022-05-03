import { Schema } from 'mongoose';

const modifSchema = new Schema({
  safeplaceId: {
    type: String,
    required: true
  },
  ownerId: {
    type: String,
  },
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  city: {
    type: String,
  },
  address: {
    type: String,
  },
  coordinate: {
    type: [String]
  },
  dayTimetable: {
    type: [String],
  },
  grade: {
    type: Number,
  },
  type: {
    type: String,
  },
  email: {
    type: String
  },
  phone: {
    type: String
  },
  web: {
    type: String
  }
}, { timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

export default modifSchema;