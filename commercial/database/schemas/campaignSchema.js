import { Schema } from 'mongoose';

const campaignSchema = new Schema({
  ownerId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  budgetSpent: {
    type: Number,
    required: false,
    default: 0
  },
  status: {
    type: String,
    required: true
  },
  startingDate: {
    type: Date,
    required: true
  },
  targets: {
    type: [String],
    required: true
  },
  safeplaceId: {
    type: String,
  }
}, { timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

export default campaignSchema;