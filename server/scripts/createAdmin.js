import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../model/user.js";
import connectDB from "../config/db.js";

// Create admin account
const createAdmin = async () => {
  try {
    await connectDB();

    const phone = "+919999999999"; // Admin phone
    const pin = "1234"; // Admin PIN
    const name = "Platform Admin";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ phone });

    if (existingAdmin) {
      console.log("❌ Admin already exists with phone:", phone);
      process.exit(1);
    }

    // Hash PIN
    const pinHash = await bcrypt.hash(pin, 12);

    // Create admin user
    const admin = await User.create({
      phone,
      pinHash,
      name,
      role: "admin",
      status: "active",
    });

    console.log("✅ Admin account created successfully!");
    console.log("📱 Phone:", phone);
    console.log("🔑 PIN:", pin);
    console.log("👤 Name:", name);
    console.log("🆔 ID:", admin._id);

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create admin:", error);
    process.exit(1);
  }
};

createAdmin();
