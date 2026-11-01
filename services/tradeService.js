import { Ok, Err } from '../result.js';
import { getAll, create, removeAt } from '../repositories/tradeRepository.js';

export async function listTrades() {
  return getAll();
}

export async function createTrade(input = {}) {
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const stock = typeof input.stock === 'string' ? input.stock.trim() : '';
  const shares = Number(input.shares);
  const pricePerShare = Number(input.pricePerShare);

  if (!name) return Err({ status: 400, message: 'Politician name is required.' });
  if (!stock) return Err({ status: 400, message: 'Stock is required.' });
  if (input.shares === undefined || input.shares === '' || !Number.isInteger(shares) || shares <= 0) {
    return Err({ status: 400, message: 'Shares must be a positive whole number.' });
  }
  if (input.pricePerShare === undefined || input.pricePerShare === '' || !Number.isFinite(pricePerShare) || pricePerShare <= 0) {
    return Err({ status: 400, message: 'Price per share must be a positive number.' });
  }

  // Computed here so the client can't send a total that doesn't match
  const totalSpent = Math.round(shares * pricePerShare * 100) / 100;

  const created = await create({ name, stock, shares, pricePerShare, totalSpent });
  return Ok(created);
}

export async function deleteTrade(rawId) {
  // Trades have no id field, so the id is the trade's position in the list
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 0) {
    return Err({ status: 404, message: 'Trade not found' });
  }
  const removed = await removeAt(id);
  if (!removed) return Err({ status: 404, message: 'Trade not found' });
  return Ok(null);
}