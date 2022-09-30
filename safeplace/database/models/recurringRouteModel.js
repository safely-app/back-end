import mongoose from 'mongoose';
import recurringRouteSchema from "../schemas/recurringRouteSchema";

const RecurringRoute = mongoose.model('RecurringRoute', recurringRouteSchema);

export default RecurringRoute;