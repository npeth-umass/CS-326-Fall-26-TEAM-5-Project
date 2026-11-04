// Runs on the Trades and Politicians pages.
// The add form sends JSON with fetch; Delete buttons send DELETE requests.

const form = document.getElementById("entry-form");
const list = document.getElementById("entries");

if (form && list) {
  const endpoint = form.dataset.endpoint; // "/trades" or "/politicians"
  const kind = form.dataset.kind; // "trade" or "politician"
  const errorBox = form.querySelector(".form-error");

  const showError = (message) => {
    errorBox.textContent = message;
    errorBox.hidden = !message;
  };

  // Text for one list item, matching what the EJS template renders
  const describe = (item) =>
    kind === "trade"
      ? `${item.stock}, ${item.shares} shares at $${item.pricePerShare}/share, $${item.totalSpent} total`
      : item.party;

  // Build an <li> with textContent (not innerHTML) so user input can't inject HTML
  function makeListItem(item, id) {
    const li = document.createElement("li");
    li.dataset.id = id;

    const span = document.createElement("span");
    const strong = document.createElement("strong");
    strong.textContent = `${item.name}:`;
    span.append(strong, ` ${describe(item)}`);

    const button = document.createElement("button");
    button.className = "delete-btn";
    button.type = "button";
    button.textContent = "Delete";

    li.append(span, " ", button);
    return li;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // stop the browser's normal form submit
    showError("");

    const data = Object.fromEntries(new FormData(form));

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        showError(result.error || "Could not save.");
        return;
      }

      const id = kind === "trade" ? result.id : result.name;
      list.append(makeListItem(result, id));
      form.reset();
    } catch {
      showError("Could not reach the server.");
    }
  });

  // One listener on the list handles every Delete button, including new ones
  list.addEventListener("click", async (event) => {
    const button = event.target.closest(".delete-btn");
    if (!button) return;

    const li = button.closest("li");
    showError("");

    try {
      const response = await fetch(
        `${endpoint}/${encodeURIComponent(li.dataset.id)}`,
        {
          method: "DELETE",
        },
      );

      if (response.status === 204) {
        li.remove();
        } else {
        const result = await response.json().catch(() => ({}));
        showError(result.error || "Could not delete.");
      }
    } catch {
      showError("Could not reach the server.");
    }
  });
}
