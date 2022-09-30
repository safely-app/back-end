import mongoose from 'mongoose';
import professionalInfoSchema from "../schemas/professionalInfoSchema";

const ProfessionalInfo = mongoose.model('ProfessionalInfo', professionalInfoSchema);

export default ProfessionalInfo;