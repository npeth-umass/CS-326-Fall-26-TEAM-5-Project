import mongoose from "mongoose";
import { connectDB } from "../db.js";
import User from "../models/userModel.js";

const roles = User.schema.path("role").enumValues; // ['member', 'admin']
const email = (process.argv[2] || "").trim().toLowerCase();
const role = process.argv[3] || "admin";

// npm run seed:admin -- you@example.com -> role becomes 'admin'
// npm run seed:admin -- you@example.com member -> back to 'member'

if (!email || !roles.includes(role)) {
  console.error(`Usage: npm run seed:admin -- <email> [${roles.join("|")}]  (default: admin)`);
  process.exit(1);
}

let exitCode = 0;
try {
  await connectDB();
  const result = await User.updateOne({ email }, { role }, { runValidators: true });
  if (result.matchedCount === 0) {
    console.error(`No account with email ${email}. Sign up in the browser first, then run this again.`);
    exitCode = 1;
  } else {
    console.log(`${email} now has the role '${role}'.`);
  }
} catch (err) {
  console.error("Could not assign the role:", err.message);
  exitCode = 1;
} finally {
  await mongoose.disconnect();
}
process.exit(exitCode);
