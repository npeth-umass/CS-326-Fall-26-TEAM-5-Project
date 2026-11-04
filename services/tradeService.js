import { Ok, Err } from "../result.js";
import { getAll, create, removeById } from "../repositories/tradeRepository.js";

const validateTrades = ({ name, stock, shares, pricePerShare } = {}) => {
  name = typeof name === "string" ? name.trim() : "";
  stock = typeof stock === "string" ? stock.trim() : "";
  shares = Number(shares);
  pricePerShare = Number(pricePerShare);

  if (!name)
    return Err({ status: 400, message: "Politician name is required." });
  if (!stock) return Err({ status: 400, message: "Stock is required." });

  if (!Number.isInteger(shares) || shares <= 0) {
    return Err({
      status: 400,
      message: "Shares must be a positive whole number.",
    });
  }

  if (!Number.isFinite(pricePerShare) || pricePerShare <= 0) {
    return Err({
      status: 400,
      message: "Price per share must be a positive number.",
    });
  }

  return Ok({ name, stock, shares, pricePerShare });
};

export async function listTrades() {
  return getAll();
}

export async function createTrade(input = {}) {
  const result = validateTrades(input);
  if (!result.ok) {
    return result;
  }

  const { name, stock, shares, pricePerShare } = result.value;
  const totalSpent = Math.round(shares * pricePerShare * 100) / 100;

  const created = await create({
    name,
    stock,
    shares,
    pricePerShare,
    totalSpent,
  });
  return Ok(created);
}

export async function deleteTrade(id) {
  const removed = await removeById(id);
  if (!removed) return Err({ status: 404, message: "Trade not found" });
  return Ok(null);
}
