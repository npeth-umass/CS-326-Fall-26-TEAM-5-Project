# CS-326-Fall-26-TEAM-5-Project

## Congressional Stock Watch

## Team Roster

## Team Roster

| Name            | GitHub Username |
| --------------- | --------------- |
| Yash Sawhney    | yashsawhney06   |
| Neville Pethani | npeth-umass     |
| Jayden Zoll     | jzoll           |
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
  Browser -> public/style.css, public/index.html
```

## New Features

```
- Split the route handler into four layers: route, controller, service and repository.
- Created Json files to permanentlys store data.
- Added EJS files for each route and navigatation between them.
- Added Home Page
- Added CSS styling for each web page.
```

## Design Decisions

Put the data in a json so we can transfer the data through commits. This is better than MongoDB because we can transfer data throughh commits.

- Neville Pethani

Created a style.css file to organize the homepage/other pages and make the ui design look nice

- Jayden Zoll

Used EJS files to display webpages instead of static HTML files. This way, we didn't have to include additional javascript file for each html file for the interface, additionally EJS provides more clarity as to what each element represents.

- Kehan Xu

Put the check for a missing trades.json in the repository so it just returns an empty list if the file isn't there yet. This is better than putting it in the service because the service shouldn't care where the data is stored.

- Yash Sawhney
