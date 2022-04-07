import { Schema } from 'mongoose';

const notificationsSchema = new Schema({
  ownerId: {
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
  }
}, { timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

export default notificationsSchema;