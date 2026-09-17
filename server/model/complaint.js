import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    // Citizen who raised the complaint
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Related service request (optional)
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
      default: null,
    },

    // Who the complaint is against (agent name, or null for platform)
    against: {
      type: String,
      default: null,
      trim: true,
    },

    // Complaint subject
    subject: {
      type: String,
      required: true,
      trim: true,
    },

    // Detailed description
    description: {
      type: String,
      required: true,
      trim: true,
    },

    // Complaint status
    status: {
      type: String,
      enum: ["open", "under-review", "resolved", "closed"],
      default: "open",
    },

    // Admin's response/resolution
    adminResponse: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;