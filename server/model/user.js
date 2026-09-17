import mongoose from "mongoose";


export const normalizePhone = (input) => {
  if (typeof input !== "string") return input;

  const digits = input.replace(/\D/g, "");

  // 91 98765 43210 → 9876543210
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91${digits.slice(2)}`;
  }

  // 0 98765 43210 → 9876543210
  if (digits.length === 11 && digits.startsWith("0")) {
    return `+91${digits.slice(1)}`;
  }

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  return digits;
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true, // Allow null/undefined for Google-only accounts
      trim: true,
      set: normalizePhone,
      validate: {
        validator: function(value) {
          // Skip validation if no phone provided (Google-only account)
          if (!value) return true;
          // Validate format for actual phone numbers
          return /^\+91[6-9]\d{9}$/.test(value);
        },
        message: "Enter a valid Indian mobile number"
      }
    },

    pinHash: {
      type: String,
      select: false,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    googleId: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ["citizen", "agent", "admin"],
      default: "citizen",
    },

    status: {
      type: String,
      enum: ["pending", "active", "rejected", "suspended"],
      default: "active",
    },

    failedPinAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastFailedAttempt: {
      type: Date,
      default: null,
    },

    lockedUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { email: { $type: "string" } },
  }
);

userSchema.index(
  { googleId: 1 },
  {
    unique: true,
    partialFilterExpression: { googleId: { $type: "string" } },
  }
);

const User = mongoose.model("User", userSchema);

export default User;
