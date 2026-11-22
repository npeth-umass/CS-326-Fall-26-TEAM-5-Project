// Keeps keyboard focus from vanishing after an HTMX swap (Sprint 4 accessibility audit).
// Without this, deleting a row removes the focused button and focus falls back to <body>,
// and adding an entry replaces the whole form (hx-swap-oob), so focus is lost there too.
document.body.addEventListener("htmx:beforeSwap", (event) => {
  const { requestConfig, xhr, target } = event.detail;
  const ok = xhr.status >= 200 && xhr.status < 300;
  const status = () => document.querySelector("#status");

  // Successful delete: move focus to the next row's Delete button (or the previous one)
  if (requestConfig.verb === "delete" && ok) {
    const row = target.closest("li");
    const neighbor = row && (row.nextElementSibling || row.previousElementSibling);
    setTimeout(() => {
      const next = neighbor && neighbor.querySelector("button");
      if (next) next.focus();
      else document.querySelector("#entry-form input").focus();
      if (status()) status().textContent = "Deleted.";
    });
    return;
  }

  // Successful add: the form gets replaced, so focus its first field again
  if (requestConfig.verb === "post" && ok) {
    setTimeout(() => document.querySelector("#entry-form input").focus());
    return;
  }

  // Error (400, 403, 404, 409): the button was disabled during the request,
  // so put focus back on what the user was using
  if (!ok) {
    setTimeout(() => {
      const form = document.querySelector("#entry-form");
      const empty = form && [...form.querySelectorAll("input")].find((i) => !i.value.trim());
      if (requestConfig.verb === "post" && empty) empty.focus();
      else if (requestConfig.elt && requestConfig.elt.isConnected) {
        const button = requestConfig.elt.matches("form") ? requestConfig.elt.querySelector("button") : requestConfig.elt;
        button.focus();
      }
    });
  }
});