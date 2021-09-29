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
  }
}, { timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

export default campaignSchema;