export const requireLogin = (req, res, next) => {
  if (req.user) return next();

  if (req.get("HX-Request")) {
    res.set("HX-Redirect", "/login");
    return res.status(401).send("Please log in");
  }

  if (req.is("application/json") || req.accepts(["html", "json"]) === "json") {
    return res.status(401).json({ error: "not logged in" });
  }

  return res.redirect(303, "/login");
};
