import express from "express";
import cookieParser from "cookie-parser";
import politicianRouter from "./routes/politician.js";
import tradeRouter from "./routes/trade.js";
import authRouter from './routes/auth.js';
import { attachUser } from './middleware/attachUser.js';
import { connectDB } from "./db.js";
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'changeSecretInProd';

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/health", (req, res) => {
  const dbUp = mongoose.connection.readyState === 1; // 1 = connected
  res.status(dbUp ? 200 : 503).json({
    status: dbUp ? "ok" : "degraded",
    db: dbUp ? "connected" : "disconnected",
    uptime: Math.round(process.uptime()),
  });
});

app.use(cookieParser(SESSION_SECRET));
app.use(attachUser);

app.use(authRouter);

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

await connectDB();
app.listen(PORT, () => {
  console.log(`Port is ${PORT} and link is http://localhost:${PORT}`);
});
