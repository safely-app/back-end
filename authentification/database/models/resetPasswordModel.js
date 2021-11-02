import mongoose from 'mongoose';
import resetPasswordSchema from "../schemas/resetPasswordSchema";

const ResetPassword = mongoose.model('ResetPassword', resetPasswordSchema);

export default ResetPassword;