# CS-326-Fall-26-TEAM-5-Project

## Congressional Stock Watch

## Team Roster

## Team Roster

| Name            | GitHub Username |
| --------------- | --------------- |
| Yash Sawhney    | yashsawhney06   |
| Neville Pethani | npeth-umass     |
| Jayden Zoll     | jzoll2          |
| Kehan Xu        | SpookyyTheGhost |

## Team Agreement!!

- **Communication:** We will coordinate over iMessage group chat per day to day basis as needed... each person checks in daily during active sprint work and responds within a few hours during working hours of project. We will also be in person at a set time when discussed and communication will be in person then.
- **How we plan to achieve work:** A PR is going to be "done" when it passes review and gets at least two teammate's approval and has no merge conflicts with `main`. It shouldn't break existing functionality as well.
- **Code review turnaround:** Reviewers aim to look at open PRs within 24 hours so work doesn't stall.
- **Disagreements:** We'll talk it out over messages and in person if need be, and aim for consensus first. If we're still stuck we will take a quick majority vote and if our team is evenly split we bring Professor Richards for his guidance on how to approach the best methodology for the course of our project as a tiebreak.
- **Task ownership:** Before starting a feature we will post in our iMessage group chat on what feature we are picking up so we don't duplicate work.

## Project Idea/Overall Goal

Our project tracks U.S. Congress members' individual stock trades alongside their voting records on related bills. We will surface potential conflicts of interest where a lawmaker voted on legislation affecting an industry, a certain sector, or a company in which they personally held stock in. This goes beyond the classroom because congressional stock trading has increasing public scrutiny, and existing disclosure data such as STOCK Act filings, roll-call votes, etc. are public but scattered and hard for ordinary citizens to cross reference, which could influence their voting. The application benefits voters and watchdog groups who want an easy way to ask "did a person vote on something they had a financial stake in?" without manually referencing or doing their own research. While we are unsure now, we expect the "corruption" methodology we use to grade to get more defined as we dig into the data and as our project develops.

## Getting Set Up

```bash
git clone https://github.com/npeth-umass/CS-326-Fall-26-TEAM-5-Project
cd "CS-326-Fall-26-TEAM-5-Project"
npm install express
npm start
```

This will start a local server at port 3000. So just go to http://localhost:3000 and you should see the server running

# How to Use

1. Run `npm install` and then `npm start` then open http://localhost:3000 in your browser. You'll see the home page with a navbar at the top.
2. Click **Politicians** in the navbar to see the list of Congress members we're tracking, with each one's name and party.
3. Click **Trades** in the navbar to see the stock trades they've made. Each trade shows the politician's name, the stock, the number of shares, the price per share, and the total spent.
4. To add a trade fill out the form on the Trades page with the politician's name, the stock, the number of shares, and the price per share, then click **Add Trade**. The new trade shows up in the list on the page.
5. If you leave out a required field, the page shows an error message saying what's missing instead of saving the trade.

## System Diagram

```
                         Browser
                            |
              GET /politicians, , /trades...
                            |
                            v
                  server.js (Express app)
                            |
              +-------------+--------------+
              |                            |
              v                            v
     routes/politician.js          routes/trade.js
              |                            |
              v                            v
 controllers/politicianController.js   controllers/tradeController.js
              |                            |
              v                            v
 services/politicianService.js     services/tradeService.js
              |                            |
              v                            v
 repositories/politicianRepository.js  repositories/tradeRepository.js
              |                            |
              v                            v
     data/politicians.json          data/trades.json

Response path:
  repository -> service -> controller -> dtos/tradeDto.js
      -> res.render('trades' / 'politicians' / 'details')
      -> views/*.ejs + views/partials/header.ejs
      -> HTML sent to Browser

  Static files:
  Browser -> public/style.css, public/index.html, public/form.js
```

## New Features

```
## Features:
- Code is split into four layers: routes, controllers, services and repositories.
- Data is stored permanently in JSON file
- Each page is an EJS template with a shared header for navigation.
- Home page with links to the politicians and trades pages.
- CSS styling for every page.
- Forms on the Politicians and Trades pages let you add and delete entries in the browser.

## Pages:
| GET | `/` | Home page with links to politicians and trades |
| GET | `/politicians` | List of politicians + create form |
| GET | `/politicians/:name` | Details for one politician (In JSON currently) |
| GET | `/trades` | List of trades for each politician |

## Adding or Deleting:
- Open `/politicians` or `/trades`.
- There is a form that you can fill in and add/remove entries with
- Server will notify you if there is a missing field/other errors

**Create a politician**

| Field | Required | Notes |
|---|---|---|
| `name` | Yes | Format "Last, First". Must be unique (case-insensitive). |
| `party` | Yes | Text |
| `state` | No | Text, e.g. `MA` |
| `chamber` | No | Text, e.g. `Senate` |

**Create a trade**

| Field | Required | Notes |
|---|---|---|
| `name` | Yes | The politician's name |
| `stock` | Yes | Text, e.g. `Google` |
| `shares` | Yes | Positive whole number |
| `pricePerShare` | Yes | Positive number |

`totalSpent` is calculated by the server (`shares × pricePerShare`)
```

## Design Decisions
### Sprint 2 Design Decisions

Put the data in a json so we can transfer the data through commits. This is better than MongoDB because we can transfer data through commits. Also if we only had the MongoDB system for storing data it would be harder to test the POST and DELETE requests since we would have to skim the actual code to find the test formats.

- Neville Pethani

Created a style.css file to organize the homepage/other pages and make the ui design look nice. I ended up choosing to use a css instead of a inline in index.html because its reusable and I didnt want to have to copy and paste the html for multiple pages. Another reason I ended up choosing to use a style.css sheet was after conversing with Neville, we decided that it would look nice and neat if all of the code for formatting ws separated into a different file, making the index code easier to read.

- Jayden Zoll

Used EJS files to display webpages instead of static HTML files. This way, we didn't have to include additional javascript file for each html file for the interface, additionally EJS provides more clarity as to what each element represents.

- Kehan Xu

Put the check for a missing trades.json in the repository so it just returns an empty list if the file isn't there yet. This is better than putting it in the service because the service shouldn't care where the data is stored.

- Yash Sawhney

### Sprint 3 Design Decisions

For Sprint 3, I switched trade deletes to use MongoDB's _id instead of the trade's position in the list as otherwise we would've had to keep using the position by sorting the trades the same way every time and deleting the "nth" one. That would have meant fewer changes, but the position shifts whenever someone else adds or deletes a trade so a Delete button could remove the wrong trade. Using _id cost us changes to trades.ejs, form.js, and deleteTrade in the service, but each Delete button now always points at the same trade.

- Yash Sawhney

## Sprint 3: MongoDB Repository

The trades and politicians features save to MongoDB instead of data/trades.json and data/politicians.json and like Unit 12 each repository (repositories/tradeRepository.js and repositories/politicianRepository.js) has its Mongoose schema in it with per record operations: getAll, findById, create, updateById, and removeById. The repositories only talk to MongoDB while all the checks like validation, duplicate names, and returning 404 when something isn't there are in the services. To see it, start MongoDB, run `npm run seed` to load the starting trades and politicians, then run `npm start` and open /trades or /politicians. Anything you add or delete stays changed after restarting the server. If you're running it on your laptop instead of the dev container, start it with `MONGODB_URI=mongodb://127.0.0.1:27017/devdb npm start`.

The routes did not change, but a few places did because they assumed a trade's id was its position in the array:
- dtos/tradeDto.js turns _id into id
- views/trades.ejs and public/form.js use the real id, and the renumbering function was removed
- services/tradeService.js deleteTrade checks findById for a 404 before removeById
- controllers/tradeController.js returns 400 for an invalid id

Politicians are still deleted by name, so their view and form.js didn't change, but politicianService.js now calls the repository instead of rewriting the JSON array, and uses findByName to return 404 before removeByName.