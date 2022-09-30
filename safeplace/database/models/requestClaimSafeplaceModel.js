import mongoose from 'mongoose';
import requestClaimSafeplaceSchema from '../schemas/requestClaimSafeplaceSchema';

const RequestClaimSafeplace = mongoose.model('RequestClaimSafeplace', requestClaimSafeplaceSchema);

export default RequestClaimSafeplace;