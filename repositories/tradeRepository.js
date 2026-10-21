import fs from "node:fs/promises";

const DATA_FILE = new URL("../data/trades.json", import.meta.url);

async function readData() {
  try {
    return JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

export const getAll = () => readData();

export async function create(trade) {
  const trades = await readData();
  trades.push(trade);
  await fs.writeFile(DATA_FILE, JSON.stringify(trades, null, 2));
  return trade;
}
