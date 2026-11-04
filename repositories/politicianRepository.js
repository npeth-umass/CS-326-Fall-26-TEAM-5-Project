import mongoose from "mongoose";
import { Politician } from "../models/politician.js";

const isValidId = (id) => mongoose.isValidObjectId(id);

export async function getAll() {
  return Politician.find().sort({ createdAt: 1 }).lean();
}

export async function findById(id) {
  if (!isValidId(id)) return null;
  return Politician.findById(id).lean();
}

export async function create(politician) {
  const created = await Politician.create(politician);
  return created.toObject();
}

export async function updateById(id, changes) {
  if (!isValidId(id)) return null;
  return Politician.findByIdAndUpdate(id, changes, {
    returnDocument: "after",
    runValidators: true,
  }).lean();
}

export async function removeById(id) {
  if (!isValidId(id)) return false;
  const removed = await Politician.findByIdAndDelete(id);
  return removed !== null;
}

// The Politicians page deletes by name, so this one stays too
export async function removeByName(name) {
  const removed = await Politician.findOneAndDelete({ name });
  return removed !== null;
}
