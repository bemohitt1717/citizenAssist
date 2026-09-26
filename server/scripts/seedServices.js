import "dotenv/config";
import mongoose from "mongoose";
import Service from "../model/service.js";
import connectDB from "../config/db.js";

// Services data matching frontend constants
const SERVICES_DATA = [
  {
    serviceId: "income-certificate",
    name: "Income Certificate",
    description: "State-issued income certificate required for scholarships, fee waivers, loan applications, and government schemes.",
    charge: "₹400 to ₹800",
    timeline: "5 to 7 working days",
    summary: "Proof of your family’s yearly income. Often needed for scholarships, fee help and government schemes.",
    requiredDocuments: ["Ration card", "Aadhaar card", "Salary slips (if employed)", "Property documents (if applicable)"],
    isActive: true,
  },
  {
    serviceId: "caste-certificate",
    name: "Caste Certificate",
    description: "Official proof of caste for reservation benefits in education, employment, and government schemes.",
    charge: "₹600 to ₹1,200",
    timeline: "7 to 12 working days",
    summary: "Proof of your SC, ST or OBC group. Often needed for reserved seats, government jobs and some benefits.",
    requiredDocuments: ["Ration card", "Aadhaar card", "School certificate", "Parents' caste certificate (if available)", "Community certificate"],
    isActive: true,
  },
  {
    serviceId: "domicile-certificate",
    name: "Domicile Certificate",
    description: "Proof of permanent residence in the state, required for state quota admissions and jobs.",
    charge: "₹500 to ₹900",
    timeline: "6 to 10 working days",
    summary: "Proof that you live in this state. Often needed for state colleges, jobs and local schemes.",
    requiredDocuments: ["Ration card", "Aadhaar card", "Birth certificate", "School leaving certificate", "Property documents (if applicable)"],
    isActive: true,
  },
  {
    serviceId: "birth-certificate",
    name: "Birth Certificate",
    description: "Official birth record from the Municipal Corporation, required for school admission and passport.",
    charge: "₹300 to ₹600",
    timeline: "3 to 5 working days",
    summary: "Proof of your date and place of birth. Often needed for school, passports and other records.",
    requiredDocuments: ["Hospital discharge summary", "Parents' Aadhaar cards", "Parents' marriage certificate", "Proof of address"],
    isActive: true,
  },
  {
    serviceId: "pan-services",
    name: "PAN Services",
    description: "Apply for new PAN card, correction in existing PAN, or reprint of lost PAN card.",
    charge: "₹400 to ₹700",
    timeline: "10 to 15 working days",
    summary: "Apply for PAN or correct an existing card. Often needed for taxes, bank accounts and some payments.",
    requiredDocuments: ["Aadhaar card", "Proof of address", "Proof of date of birth", "Passport-size photograph"],
    isActive: true,
  },
  {
    serviceId: "aadhaar-services",
    name: "Aadhaar Services",
    description: "New Aadhaar enrollment, update mobile/address, or download e-Aadhaar.",
    charge: "₹200 to ₹500",
    timeline: "2 to 4 working days",
    summary: "Update your address, phone number, name or birth date, or get help applying for Aadhaar.",
    requiredDocuments: ["Proof of identity", "Proof of address", "Date of birth proof"],
    isActive: true,
  },
];

const seedServices = async () => {
  try {
    await connectDB();

    console.log("🌱 [SEED] Starting service seeding...");

    // Clear existing services
    await Service.deleteMany({});
    console.log("🗑️  [SEED] Cleared existing services");

    // Insert new services
    for (const serviceData of SERVICES_DATA) {
      const service = await Service.create(serviceData);
      console.log(`✅ [SEED] Created: ${service.name} (${service.serviceId})`);
    }

    console.log(`\n✅ [SEED] Successfully seeded ${SERVICES_DATA.length} services!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ [SEED] Failed to seed services:", error);
    process.exit(1);
  }
};

seedServices();
