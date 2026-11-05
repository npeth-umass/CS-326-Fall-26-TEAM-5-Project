import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://dev:devpassword@mongo:27017/devdb?authSource=admin";

export async function connectDB() {
  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to MongoDB at ${MONGODB_URI}`);
}
