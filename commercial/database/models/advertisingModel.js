import mongoose from 'mongoose';
import advertisingSchema from "../schemas/advertisingSchema";

const Advertising = mongoose.model('Advertising', advertisingSchema);

export default Advertising;