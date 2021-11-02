import mongoose from 'mongoose';
import safeplaceCommentSchema from "../schemas/safeplaceCommentsSchema";

const SafeplaceComment = mongoose.model('SafeplaceComment', safeplaceCommentSchema);

export default SafeplaceComment;