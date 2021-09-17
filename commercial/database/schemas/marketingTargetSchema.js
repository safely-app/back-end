import { Schema } from 'mongoose';

const marketingTargetSchema = new Schema({
  ownerId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  csp: {
    type: String,
    required: true
  },
  interests: {
    type: [String],
    required: true
  },
  ageRange: {
    type: String,
    required: true
  }
}, { timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

export default marketingTargetSchema;