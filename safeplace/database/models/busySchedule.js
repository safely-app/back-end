import mongoose from 'mongoose';
import busyScheduleSchema from "../schemas/busyScheduleSchema";

const BusySchedule = mongoose.model('BusySchedule', busyScheduleSchema);

export default BusySchedule;

