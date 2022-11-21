import { Schema } from 'mongoose';

const lightSchema = new Schema({
  street: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  power: {
    type: Number,
    required: true
  },
  coordinate: {
    type: Array,
    required: true
  }
}, { timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

export default lightSchema;