import express from "express";
import politicianRouter from "./routes/politician.js";
import tradeRouter from "./routes/trade.js";

const app = express();
const PORT = process.env.port || 3000;

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static("public"));
app.use(express.json());
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
  res.send("Page was not found :(");
});

app.listen(PORT, () => {
  console.log(`Port is ${PORT} and link is http://localhost:${PORT}`);
});
