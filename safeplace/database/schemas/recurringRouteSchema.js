import { Schema } from 'mongoose';

const recurringRouteSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  coordinate: {
    type: [String]
  }
}, { timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

export default recurringRouteSchema;