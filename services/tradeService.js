import { Ok, Err } from "../result.js";
import {
  getAll,
  findById,
  create,
  removeById,
} from "../repositories/tradeRepository.js";
import { toTradeDto } from "../dtos/tradeDto.js";

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

export const isOwnerOrAdmin = (user, trade) => {
  if (!user) return false;
  if (user.role === "admin") return true;
  return trade.ownerId != null && String(trade.ownerId) === String(user.id);
};

const NOT_LOGGED_IN = { status: 401, message: "You must be logged in." };

export async function listTrades() {
  return (await getAll()).map(toTradeDto);
}

export async function createTrade(input = {}, user) {
  if (!user) return Err(NOT_LOGGED_IN);

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
    ownerId: user.id,
  });
  return Ok(toTradeDto(created));
}

export async function deleteTrade(id, user) {
  if (!user) return Err(NOT_LOGGED_IN);

  const existing = await findById(id);
  if (!existing) return Err({ status: 404, message: "Trade not found" });

  if (!isOwnerOrAdmin(user, existing)) {
    return Err({
      status: 403,
      message: "You can only delete trades you created.",
    });
  }
  await removeById(id);
  return Ok(null);
}
