import * as politicianService from "../services/politicianService.js";

export async function index(req, res) {
  const politicians = await politicianService.listPoliticians();
  res.set("X-Total-Count", String(politicians.length));
  res
    .status(200)
    .render("politicians", { politicians, count: politicians.length });
}

export async function searchByName(req, res) {
  const politicians = await politicianService.listPoliticians(req.params.name);
  res.set("X-Total-Count", String(politicians.length));
  res.status(200).json({ politicians, count: politicians.length });
}

export async function create(req, res) {
  const result = await politicianService.createPolitician(req.body);
  if (!result.ok) {
    res.status(result.error.status).json({ error: result.error.message });
    return;
  }
  res.status(201).json(result.value);
}

export async function destroy(req, res) {
  const result = await politicianService.deletePolitician(req.params.name);
  if (!result.ok) {
    res.status(result.error.status).json({ error: result.error.message });
    return;
  }
  res.status(204).send();
}
