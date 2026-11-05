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
npm install mongoose
npm install --save-dev jest@30
npm test
dc-up mongo
npm start
```
Then in another terminal window run:
```bash
npm run seed
```
This will start you out with the basic pre-made dataset for testing.

This will start a local server at port 3000. So just go to http://localhost:3000 and you should see the server running

# How to Use

1. Run `npm install` and then `npm start` then open http://localhost:3000 in your browser. You'll see the home page with a navbar at the top.
2. Click **Politicians** in the navbar to see the list of Congress members we're tracking, with each one's name and party.
3. Click **Trades** in the navbar to see the stock trades they've made. Each trade shows the politician's name, the stock, the number of shares, the price per share, and the total spent.
4. To add a trade fill out the form on the Trades page with the politician's name, the stock, the number of shares, and the price per share, then click **Add Trade**. The new trade shows up in the list on the page.
5. If you leave out a required field, the page shows an error message saying what's missing instead of saving the trade.

## System Diagram
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
- Split the route handler into four layers: route, controller, service and repository.
- Created Json files to permanentlys store data.
- Added EJS files for each route and navigatation between them.
- Added Home Page
- Added CSS styling for each web page.
- Added Jest tests for every validation rule our service layer enforces, to use the test right npm test into the terminal
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

| Field     | Required | Notes                                                    |
| --------- | -------- | -------------------------------------------------------- |
| `name`    | Yes      | Format "Last, First". Must be unique (case-insensitive). |
| `party`   | Yes      | Text                                                     |
| `state`   | No       | Text, e.g. `MA`                                          |
| `chamber` | No       | Text, e.g. `Senate`                                      |

**Create a trade**

| Field           | Required | Notes                 |
| --------------- | -------- | --------------------- |
| `name`          | Yes      | The politician's name |
| `stock`         | Yes      | Text, e.g. `Google`   |
| `shares`        | Yes      | Positive whole number |
| `pricePerShare` | Yes      | Positive number       |

`totalSpent` is calculated by the server (`shares × pricePerShare`)
```

## Design Decisions
### Sprint 2 Design Decisions

Put the data in a json so we can transfer the data through commits. This is better than MongoDB because we can transfer data through commits. Also if we only had the MongoDB system for storing data it would be harder to test the POST and DELETE requests since we would have to skim the actual code to find the test formats.

\- Neville Pethani

Created a style.css file to organize the homepage/other pages and make the ui design look nice. I ended up choosing to use a css instead of a inline in index.html because its reusable and I didnt want to have to copy and paste the html for multiple pages. Another reason I ended up choosing to use a style.css sheet was after conversing with Neville, we decided that it would look nice and neat if all of the code for formatting ws separated into a different file, making the index code easier to read.

\- Jayden Zoll

Used EJS files to display webpages instead of static HTML files. This way, we didn't have to include additional javascript file for each html file for the interface, additionally EJS provides more clarity as to what each element represents.

\- Kehan Xu

Put the check for a missing trades.json in the repository so it just returns an empty list if the file isn't there yet. This is better than putting it in the service because the service shouldn't care where the data is stored.

\- Yash Sawhney

### Sprint 3 Design Decisions

Added a home button to the navbar since it isn't completely obvious to click the name on the top left to go back to the home page. Also added htmx to keep the javascript more clean for the form. Instead of having to go through lines of javascript that may be a bit unclear, the htmx allows us to see directly what is happening in the ejs files directly making it not only easier to read but also easier to debug.

\- Neville Pethani

For Sprint 3, I switched trade deletes to use MongoDB's _id instead of the trade's position in the list as otherwise we would've had to keep using the position by sorting the trades the same way every time and deleting the "nth" one. That would have meant fewer changes, but the position shifts whenever someone else adds or deletes a trade so a Delete button could remove the wrong trade. Using _id cost us changes to trades.ejs, form.js, and deleteTrade in the service, but each Delete button now always points at the same trade.

\- Yash Sawhney

For the service-layer tests, I replaced the repositories with test doubles using `jest.unstable_mockModule` similar to how we were taught to do it in unit 13. One alternative was to test the services against the real repositories, but I think the mocked version is better for these tests because they are about our validation rules. With mocks the suite runs in under a second needs nothing running and leaves no data behind.

- Jayden Zoll
## Sprint 3: MongoDB Repository

The trades feature now saves to MongoDB instead of data/trades.json and the repository (repositories/tradeRepository.js) uses a Mongoose schema (models/trade.js) with per record operations: getAll, findById, create, updateById, and removeById. To see it, start MongoDB, run `npm run seed` to load the starting trades, then run `npm start` and open /trades. Trades you add or delete stay changed after restarting the server.

Exceptions: the routes and controller did not change while three other places did because they all assumed a trade's id was its position in the array:
- views/trades.ejs now puts trade._id on each list item instead of the list index
- public/form.js uses the _id from the server for new trades, and the function that renumbered ids after an add or delete was removed
- services/tradeService.js deleteTrade no longer converts the id to a number, it just passes it to removeById

Politicians also moved to MongoDB (models/politician.js, repositories/politicianRepository.js) where Politicians are still deleted by name, so the view and form.js didn't change, but services/politicianService.js did as it had its own create and removeByName functions that read and rewrote the whole JSON array so those moved into the repository.
