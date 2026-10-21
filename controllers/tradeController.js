import * as tradeService from "../services/tradeService.js";

export async function index(req, res) {
  const trades = await tradeService.listTrades();
  res.status(200).render("trades", { trades });
}

export async function create(req, res) {
  const result = await tradeService.createTrade(req.body);
  if (!result.ok) {
    res.status(result.error.status).json({ error: result.error.message });
    return;
  }
  res.status(201).json(result.value);
}
