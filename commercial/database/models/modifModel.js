import mongoose from 'mongoose';
import modifSchema from "../schemas/modifSchema";

const Modif = mongoose.model('Modif', modifSchema);

export default Modif;