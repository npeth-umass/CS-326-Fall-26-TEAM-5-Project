import mongoose from "mongoose";
import { Trade } from "../models/trade.js";

// An id that isn't a valid ObjectId can't match anything, so treat it as not found
const isValidId = (id) => mongoose.isValidObjectId(id);

export async function getAll() {
  return Trade.find().sort({ createdAt: 1 }).lean();
}

export async function findById(id) {
  if (!isValidId(id)) return null;
  return Trade.findById(id).lean();
}

export async function create(trade) {
  const created = await Trade.create(trade);
  return created.toObject();
}

export async function updateById(id, changes) {
  if (!isValidId(id)) return null;
  return Trade.findByIdAndUpdate(id, changes, {
    returnDocument: "after",
    runValidators: true,
  }).lean();
}

export async function removeById(id) {
  if (!isValidId(id)) return false;
  const removed = await Trade.findByIdAndDelete(id);
  return removed !== null;
}
