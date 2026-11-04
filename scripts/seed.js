// Copies the old trades.json into MongoDB so the Trades page has data to show
// Run with: npm run seed
import fs from "node:fs/promises";
import mongoose from "mongoose";
import { connectDB } from "../db.js";
import { Trade } from "../models/trade.js";
import { Politician } from "../models/politician.js";

const file = new URL("../data/trades.json", import.meta.url);
const politiciansFile = new URL("../data/politicians.json", import.meta.url);
const politicians = JSON.parse(await fs.readFile(politiciansFile, "utf8"));
const trades = JSON.parse(await fs.readFile(file, "utf8")).map((t) => ({
  name: t.name,
  stock: t.stock,
  shares: Number(t.shares),
  pricePerShare: Number(t.pricePerShare),
  totalSpent: Number(t.totalSpent),
}));

await connectDB();
await Trade.deleteMany({});
await Trade.insertMany(trades);
console.log(`Seeded ${trades.length} trades`);
await Politician.deleteMany({});
await Politician.insertMany(politicians);
console.log(`Seeded ${politicians.length} politicians`);
await mongoose.disconnect();
