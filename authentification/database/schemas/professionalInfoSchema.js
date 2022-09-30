import { Schema } from "mongoose";

const professionalInfoSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  companyAddress: {
    type: String,
    required: true
  },
  companyAddress2: {
    type: String
  },
  billingAddress: {
    type: String,
    required: true
  },
  clientNumberTVA: {
    type: String,
    required: true
  },
  personalPhone: {
    type: String,
  },
  companyPhone: {
    type: String,
    required: true
  },
  RCS: {
    type: String,
  },
  registrationCity: {
    type: String
  },
  SIREN: {
    type: String
  },
  SIRET: {
    type: String
  },
  artisanNumber: {
    type: String
  },
  type: {
    type: String,
    required: true
  }
}, { timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

export default professionalInfoSchema;