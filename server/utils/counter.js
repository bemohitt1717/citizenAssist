import mongoose from "mongoose";

// Counter model for generating unique reference numbers
const counterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: Number,
    default: 0,
  },
});

const Counter = mongoose.model("Counter", counterSchema);

// Generate next reference number like CA-4821, CA-4822, etc.
export const getNextReference = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "request-reference" },
    { $inc: { value: 1 } },
    { new: true, upsert: true } // Create if doesn't exist
  );

  return `CA-${counter.value}`;
};
