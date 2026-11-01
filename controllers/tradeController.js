import * as tradeService from "../services/tradeService.js";

async function renderPage(res, status, error = null, values = {}) {
  const trades = await tradeService.listTrades();
  res.status(status).render("trades", { trades, error, values });
}

export async function index(req, res) {
  await renderPage(res, 200);
}

// POST /trades: used by form.js (fetch), replies with JSON
export async function create(req, res) {
  const result = await tradeService.createTrade(req.body);
  if (!result.ok) {
    res.status(result.error.status).json({ error: result.error.message });
    return;
  }
  res.status(201).json(result.value);
}


// DELETE /trades/:id: used by form.js
export async function destroy(req, res) {
  const result = await tradeService.deleteTrade(req.params.id);
  if (!result.ok) {
    res.status(result.error.status).json({ error: result.error.message });
    return;
  }
  res.status(204).send();
}