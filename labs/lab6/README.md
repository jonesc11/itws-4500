# jonesc11 - Lab 6 - Tweet Scraper with CSV support - Web Science Systems Development

The purpose of this lab is to practice reading and writing data in multiple formats. It was implemented using basic web tools
listed below.

## Installation

Move this folder somewhere on your computer. In a command prompt, navigate to inside of this folder, and type either "npm start" or "node app.js". Then, in a web browser, navigate to http://localhost:3000. Verified working browsers are Firefox 58.0, Chrome 63.0,
Opera 50, and Edge 41.

## Design Decisions

I decided to use the same code and styles as in lab 5 to save time, and the code worked well enough that it wasn't an issue.

I kept most of the lab the same as lab 5. This is because there was only a minor modification required to port lab 5 to lab 6, and I felt like most of the other features asked for in lab 5 did not take away from the features required in lab 6, and the application
still had a place for it.

In order to accommodate multiple connections, I kept track of which tweets went to which socket by using an object where each key referred to an array of tweets. This worked well, and means the lab could be extended to allow users to download a JSON or CSV of
their tweets.

I decided to use NPM's twitter package in conjunction with socket.io to deliver tweets from Twitter to the client in real-time (or as real-time as I could get).

Although my keys are available for you (the grader) to see, that is still a server-side script, so they are safe from prying eyes.

I chose to use AngularJS instead of Angular 2, 4, or 5 because that is the Angular framework I am most familiar with.

## Tools

For this project, I used HTML5, CSS3, JavaScript, Bootstrap 4, AngularJS, jQuery 3.2.1, NodeJS, ExpressJS, Socket.io, fast-csv, and the Twitter Streaming API. JavaScript and jQuery mostly aided AngularJS, as well as helped with some visual effects. Socket.io
allowed me to receive the tweets as they came in to the server through the streaming API instead of all at once. NodeJS was my server-side language, and it was turned into a web framework via ExpressJS.

## Question

I would argue that it's better to keep the CSV conversion code in the NodeJS server for a couple of reasons. First, this allows us to save files directly to the server and doesn't make us send data from AngularJS to Node. Although it does add some processing and
complicated code when you work with multiple clients connecting at once, you don't have to transfer all of that data more than once like you might if you used Angular. Additionally, there are Node packages that allow us to perform these operations easily, and this
is not the case with AngularJS, so it keeps our code cleaner and more readable.