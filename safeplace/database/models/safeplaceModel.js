import mongoose from 'mongoose';
import safeplaceSchema from "../schemas/safeplaceSchema";

const Safeplace = mongoose.model('Safeplace', safeplaceSchema);

export default Safeplace;