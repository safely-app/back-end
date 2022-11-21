import mongoose from 'mongoose';
import lightSchema from "../schemas/lightSchema";

const Light = mongoose.model('Light', lightSchema);

export default Light;