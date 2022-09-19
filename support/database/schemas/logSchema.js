import { Schema } from 'mongoose';

const logSchema = new Schema({
  level: {
    type: String
  },
  message: {
    type: String
  },
});

export default logSchema;