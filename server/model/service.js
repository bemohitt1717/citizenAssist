import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    // Frontend service ID (income-certificate, etc.)
    serviceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    // Charge range displayed to users
    charge: {
      type: String,
      required: true,
      trim: true,
    },

    // Timeline text (e.g., "5 to 7 working days")
    timeline: {
      type: String,
      required: true,
      trim: true,
    },

    // Short summary for service cards
    summary: {
      type: String,
      required: true,
      trim: true,
    },

    requiredDocuments: [
      {
        type: String,
        trim: true,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.model("Service", serviceSchema);

export default Service;