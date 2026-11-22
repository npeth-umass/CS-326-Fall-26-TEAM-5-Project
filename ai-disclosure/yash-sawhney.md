# AI Disclosure — Yash Sawhney

I simply asked Claude for idea on how to format the team roster table (names and GitHub usernames) so it woul simply be neat and clean. Everything from content to formatting and construction of the project description, working agreement, and README merges were written and done by me.

## Sprint 2

I used Claude to help think of ideas for the trades feature, which is routes/trade.js, controllers/tradeController.js, services/tradeService.js, and repositories/tradeRepository.js. I followed and implemneted the same route/controller/service/repository setup as the politician feature. I added the files to the project, hooked up the /trades route in server.js, and tested that GET /trades works. I used Claude to help with the git commands for moving the files into the right folders after they all ended up in routes by mistake, and to help write my README section.

## Sprint 3

I used Claude to help tell me where I could improve in the MongoDB repository for trades, the Mongoose schema and the changes to trades.ejs, form.js, and tradeService.js for switching from list positions to MongoDB ids. I tested it locally by adding and deleting trades and checking they stayed after a refresh.

## Sprint 4

I used Claude to help think of ideas for the accessibility audit. This covered public/focus.js, which keeps the focus from disappearing after adding, deleting, or getting an error. It also covered the hidden labels on the trade and politician form inputs, the focus outline in src/input.css, the fixes to the titles and header.ejs, and the contrast ratio calculations. I implemented the changes in the project myself. I tested everything on /trades and /politicians using only the keyboard and checked a couple of the contrast numbers in Chrome’s dev tools. I also used Claude to help with the git commands to push it quickly.