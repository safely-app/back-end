import { Schema } from 'mongoose';

const advertisingSchema = new Schema({
  ownerId: {
    type: String,
    required: true
  },
  campaignId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  targetType: {
    type: [String],
    required: true
  },
  radius: {
    type: Number,
    required: false
  }
}, { timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

export default advertisingSchema;