import mongoose from "mongoose";

const politicianSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    party: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    chamber: { type: String, trim: true },
    district: { type: Number, min: 0 },
    bioguideId: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
  },
  { timestamps: true },
);

export const Politician = mongoose.model("Politician", politicianSchema);
