import { Ok, Err } from '../result.js';
import { getAll, create } from '../repositories/tradeRepository.js';

export async function listTrades() {
  return getAll();
}

export async function createTrade(input = {}) {
  if (!input.politicianName || !input.ticker) {
    return Err({ status: 400, message: 'politicianName and ticker are required' });
  }
  const created = await create(input);
  return Ok(created);
}
