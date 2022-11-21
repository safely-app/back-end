import mongoose from 'mongoose';
import busyScheduleSchema from "../schemas/busyScheduleSchema";

const BusySchedule = mongoose.model('busySchedule', busyScheduleSchema);

export default BusySchedule;

