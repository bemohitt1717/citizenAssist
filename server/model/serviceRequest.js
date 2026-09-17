import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema(
  {
    // Unique reference like CA-4821, generated when created
    reference: {
      type: String,
      unique: true,
      required: true,
    },

    // Citizen who submitted this request
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Service ID from frontend (income-certificate, etc.)
    serviceId: {
      type: String,
      required: true,
    },

    // Service name (denormalized for easy display)
    serviceName: {
      type: String,
      required: true,
    },

    // Agent assigned to this request (null until assigned)
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      default: null,
    },

    // Agent name (denormalized for quick lookup)
    agentName: {
      type: String,
      default: null,
    },

    // Request status: pending, assigned, review, processing, completed, action, rejected, cancelled
    status: {
      type: String,
      enum: [
        "pending",
        "assigned",
        "review",
        "processing",
        "completed",
        "action",
        "rejected",
        "cancelled",
      ],
      default: "pending",
    },

    // Charge confirmed by agent (e.g., "₹650")
    charge: {
      type: String,
      default: null,
    },

    // Applicant details from the request flow form
    applicantDetails: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },

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

      district: {
        type: String,
        required: true,
        trim: true,
      },

      address: {
        type: String,
        default: "",
        trim: true,
      },
    },

    // Timeline: append-only history of status changes
    timeline: [
      {
        status: {
          type: String,
          required: true,
        },
        at: {
          type: String,
          required: true,
        },
        note: {
          type: String,
          default: "",
        },
      },
    ],

    // Documents attached by citizen (file names or paths)
    documents: [
      {
        type: String,
      },
    ],

    // Final document uploaded by agent (e.g., certificate PDF)
    completedDocument: {
      type: String,
      default: "",
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Gives us createdAt and updatedAt
  }
);

const ServiceRequest = mongoose.model("ServiceRequest", serviceRequestSchema);

export default ServiceRequest;