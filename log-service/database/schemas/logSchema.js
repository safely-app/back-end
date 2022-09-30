import { Schema } from 'mongoose';

const logSchema = new Schema({
  logLvl: {
    type: String,
    required: true
  },
  logContent: {
    type: String,
    required: true
  },
  logService: {
    type: String,
    required: true
  },
  logChannels: {
    type: [String],
    required: true
  }
}, { timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

export default logSchema;