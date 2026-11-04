import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    stock: { type: String, required: true },
    shares: { type: Number, required: true },
    pricePerShare: { type: Number, required: true },
    totalSpent: { type: Number, required: true },
  },
  { timestamps: true },
);

export const Trade = mongoose.model("Trade", tradeSchema);

export const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getAll = async () => Trade.find().lean();

export const findById = async (id) => Trade.findById(id).lean();

export const create = async (data) => (await Trade.create(data)).toObject();

export const updateById = async (id, data) =>
  Trade.findByIdAndUpdate(id, data, { new: true }).lean();

export const removeById = async (id) => {
  await Trade.findByIdAndDelete(id);
};
