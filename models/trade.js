import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    stock: { type: String, required: true, trim: true },
    shares: { type: Number, required: true, min: 1 },
    pricePerShare: { type: Number, required: true, min: 0.01 },
    totalSpent: { type: Number, required: true },
  },
  { timestamps: true },
);

export const Trade = mongoose.model("Trade", tradeSchema);
