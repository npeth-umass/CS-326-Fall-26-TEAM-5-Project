import express from "express";

const app = express();
const PORT = process.env.port || 3000;

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static("public"));

app.get("/index", (req, res) => {
  res.render("index", { title: "Objective" });
});

app.get("/details", (req, res) => {
  //Copied from our readme.md
  res.send(`Our project tracks U.S. Congress members'
    individual stock trades alongside their voting records on related bills.
    We will surface potential conflicts of interest where a lawmaker voted
    on legislation affecting an industry, a certain sector, or a company
    in which they personally held stock in. This goes beyond the classroom
    because congressional stock trading has increasing public scrutiny, and
    existing disclosure data such as STOCK Act filings, roll-call votes, etc.
    are public but scattered and hard for ordinary citizens to cross reference,
    which could influence their voting. The application benefits voters and
    watchdog groups who want an easy way to ask \"did a person vote
    on something they had a financial stake in?\" without manually
    referencing or doing their own research. While we are unsure now,
    we expect the \"corruption\" methodology we use to grade to get
    more defined as we dig into the data and as our project develops.`);
});

app.get("/stocks", (req, res) => {
  res.send("This is where we will be putting the stocks of congress"); //Change the text here
});

app.use((req, res) => {
  res.send("Page was not found :(");
});

app.listen(PORT, () => {
  console.log(`Port is ${PORT} and link is http://localhost:${PORT}`);
});
