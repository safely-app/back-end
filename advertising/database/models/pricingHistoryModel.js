import mongoose from 'mongoose';
import pricingHistorySchema from '../schemas/pricingHistorySchema';

const PricingHistory = mongoose.model('PricingHistory', pricingHistorySchema);

export default PricingHistory;