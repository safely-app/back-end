import mongoose from 'mongoose';
import busyScheduleSchema from "../schemas/busyScheduleSchema";

const busySchedule = mongoose.model('BusySchedule', busyScheduleSchema);

export default busySchedule;