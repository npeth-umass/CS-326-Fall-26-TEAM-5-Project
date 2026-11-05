import mongoose from "mongoose";

const politicianSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    party: { type: String, required: true },
    state: { type: String },
    chamber: { type: String },
    district: { type: Number },
    bioguideId: { type: String },
    imageUrl: { type: String },
  },
  { timestamps: true },
);

export const Politician = mongoose.model("Politician", politicianSchema);

export const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getAll = async () => Politician.find().lean();

export const findById = async (id) => Politician.findById(id).lean();

export const findByName = async (name) => Politician.findOne({ name }).lean();

export const create = async (data) =>
  (await Politician.create(data)).toObject();

export const updateById = async (id, data) =>
  Politician.findByIdAndUpdate(id, data, { new: true }).lean();

export const removeById = async (id) => {
  await Politician.findByIdAndDelete(id);
};

export const removeByName = async (name) => {
  await Politician.findOneAndDelete({ name });
};
