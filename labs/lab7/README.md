# jonesc11 - Lab 7 - Tweet Scraper with XML and MongoDB support - Web Science Systems Development

The purpose of this lab is to practice reading and writing data to and from the CSV format and to and from a MongoDB database.. It was implemented using basic web tools listed below.

## Installation

Move this folder somewhere on your computer. In a command prompt, navigate to inside of this folder, and type either "npm start" or "node app.js". Then, in a web browser, navigate to http://localhost:3000. Verified working browsers
are Firefox 58.0, Chrome 63.0, Opera 50, and Edge 41.

## Design Decisions

I decided to use the same code and styles as in lab 6 to save time, and the code worked well enough that it wasn't an issue.

I kept most of the lab the same as lab 6. This is because there was only a minor modification required to port lab 6 to lab 7, and I felt like most of the other features asked for in lab 6 did not take away from the features
required in lab 7, and the application still had a place for it.

I included a username sort of feature to this. Obviously, there is nothing stopping someone from entering someone else's username and viewing the tweets, but for the purpose of this lab, this is just to give the user a way to
filter his / her tweets from anyone else's. This could easily be extended to a login feature using some framework such as PassportJS.

Although my keys are available for you (the grader) to see, that is still a server-side script, so they are safe from prying eyes.

I chose to use AngularJS instead of Angular 2, 4, or 5 because that is the Angular framework I am most familiar with.

## Tools

For this project, I used HTML5, CSS3, JavaScript, Bootstrap 4, AngularJS, jQuery 3.2.1, NodeJS, ExpressJS, Socket.io, fast-csv, js2xmlparser, MongoDB, and the Twitter Streaming API. JavaScript and jQuery mostly aided AngularJS,
as well as helped with some visual effects. Socket.io allowed me to receive the tweets as they came in to the server through the streaming API instead of all at once. NodeJS was my server-side language, and it was turned into a
web framework via ExpressJS. MongoDB for NodeJS helped me load the tweets into a MongoDB database.
