import mongoose from "mongoose";

const agentSchema = new mongoose.Schema(
  {
    // Reference to User account
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Verification status: pending, active, rejected, suspended
    verificationStatus: {
      type: String,
      enum: ["pending", "active", "rejected", "suspended"],
      default: "pending",
    },

    // Agent name (denormalized from User for quick lookup)
    name: {
      type: String,
      default: "",
      trim: true,
    },

    // Contact details
    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
    },

    // District where agent operates (not city/state)
    district: {
      type: String,
      required: true,
      trim: true,
    },

    // Experience level (string like "1 to 3 years", "More than 7 years")
    experience: {
      type: String,
      required: true,
      trim: true,
    },

    // Services agent can handle (array of service IDs like "income-certificate")
    services: [
      {
        type: String,
        trim: true,
      },
    ],

    // When agent applied
    appliedAt: {
      type: Date,
      default: Date.now,
    },

    // When agent was verified (null if not verified yet)
    verifiedOn: {
      type: Date,
      default: null,
    },

    // Total requests assigned to this agent
    totalRequests: {
      type: Number,
      default: 0,
    },

    // Completed requests count
    completedRequests: {
      type: Number,
      default: 0,
    },

    // Average rating (0 if no ratings yet)
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    // Is agent currently available for new requests
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Agent = mongoose.model("Agent", agentSchema);

export default Agent;