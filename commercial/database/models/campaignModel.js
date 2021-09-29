import mongoose from 'mongoose';
import CampaignSchema from "../schemas/campaignSchema";

const Campaign = mongoose.model('Campaign', CampaignSchema);

export default Campaign;