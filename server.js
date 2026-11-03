import express from "express";
import politicianRouter from "./routes/politician.js";
import tradeRouter from "./routes/trade.js";

const app = express();
const PORT = process.env.port || 3000;

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/politicians", politicianRouter);
app.use("/trades", tradeRouter);

app.get("/index", (req, res) => {
  res.render("index", { title: "Objective" });
});

app.get("/details", (req, res) => {
  //Copied from our readme.md
  res.status(200).render("details");
});

app.get("/stocks", (req, res) => {
  res.send(
    "This is where we will be putting the stock trades of different congress members",
  );
});

app.use((req, res) => {
  res.status(404).send("Page not found.");
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  let status = err.status || err.statusCode || 500;
  let message = err.message;

  if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Malformed JSON";
  }
  if (status >= 500) {
    console.error(err);
    message = "Something went wrong.";
  }

  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`Port is ${PORT} and link is http://localhost:${PORT}`);
});
