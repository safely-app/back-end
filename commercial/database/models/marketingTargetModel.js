import mongoose from 'mongoose';
import marketingTargetSchema from "../schemas/marketingTargetSchema";

const MarketingTarget = mongoose.model('MarketingTarget', marketingTargetSchema);

export default MarketingTarget;