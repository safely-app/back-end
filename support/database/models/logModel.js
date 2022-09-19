import mongoose from 'mongoose';
import logSchema from "../schemas/logSchema";

const Log = mongoose.model('Log', logSchema);

export default Log;