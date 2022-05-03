import mongoose from 'mongoose';
import notificationsSchema from "../schemas/notificationsSchema";

const Notifications = mongoose.model('Notifications', notificationsSchema);

export default Notifications;