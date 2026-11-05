import * as tradeService from "../services/tradeService.js";
import { isValidId } from "../repositories/tradeRepository.js";

const fromHtmx = (req) => req.get('HX-Request') === 'true';

// htmx swaps an error answer into the page's status line (see the
// htmx-config meta tag in views/entries.ejs), so it gets plain text.
const sendError = (req, res, { status, message }) => {
  if (fromHtmx(req)) {
    res.status(status).send(message);
    return;
  }
  res.status(status).json({ error: message });
};

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
  if (!result.ok) return sendError(req, res, result.error);
  if (fromHtmx(req)) {
    res.status(201).render('partials/trade-created', { trade: result.value });
    return;
  }
  res.status(201).json(result.value);
}


// DELETE /trades/:id: used by form.js
export async function destroy(req, res) {
  const { id } = req.params;
  if (!isValidId(id)) {
    res.status(400).json({ error: "id must be a valid id" });
    return;
  }
  const result = await tradeService.deleteTrade(id);
  if (!result.ok) {
    res.status(result.error.status).json({ error: result.error.message });
    return;
  }
  res.status(200).send();
}
