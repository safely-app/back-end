import mongoose from 'mongoose';
import supportRequestSchema from "../schemas/supportRequestSchema";

const SupportRequest = mongoose.model('SupportRequest', supportRequestSchema);

export default SupportRequest;