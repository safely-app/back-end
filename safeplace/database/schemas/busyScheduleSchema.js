import { Schema } from 'mongoose';

const busyScheduleSchema = new Schema({
  query: {
    type: String,
  },
  schedule: {
    type: Object,
  },
  coordinate: {
    type: [String]
  },
}, { timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

export default busyScheduleSchema;
