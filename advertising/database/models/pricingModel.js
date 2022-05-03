import mongoose from 'mongoose';
import pricingSchema from '../schemas/pricingSchema';

const Pricing = mongoose.model('Pricing', pricingSchema);

export default Pricing;