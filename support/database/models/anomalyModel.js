import mongoose from 'mongoose';
import anomalySchema from "../schemas/anomalySchema";

const Anomaly = mongoose.model('Anomaly', anomalySchema);

export default Anomaly;