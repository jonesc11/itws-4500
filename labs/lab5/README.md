# jonesc11 - Lab 4 - Weather Application v2 - Web Science Systems Development

The purpose of this application is to create a web application using AngularJS, NodeJS, the Twitter Streaming API, jQuery, and ExpressJS to collect data and display it on screen, as well as save the data to a JSON file. It was implemented using basic web tools
listed below.

## Installation

Move this folder somewhere on your computer. In a command prompt, navigate to inside of this folder, and type either "npm start" or "node app.js". Then, in a web browser, navigate to http://localhost:3000. Verified working browsers are Firefox 58.0, Chrome 63.0,
Opera 50, and Edge 41.

## Design Decisions

I decided to use the same code and styles as in lab 1 to save time, and the code worked well enough that it wasn't an issue.

I decided to remove the links to usernames and hashtags because the provided indicies for entities in the JSON data returned were sometimes off. I discovered that this was due to some emojis (particularly American Flag emojis) turning into text and throwing the
entity index off.

I decided to use NPM's twitter package in conjunction with socket.io to deliver tweets from Twitter to the client in real-time (or as real-time as I could get).

Although my keys are available for you (the grader) to see, that is still a server-side script, so they are safe from prying eyes.

I chose to use AngularJS instead of Angular 2, 4, or 5 because that is the Angular framework I am most familiar with.

## Tools

For this project, I used HTML5, CSS3, JavaScript, Bootstrap 4, AngularJS, jQuery 3.2.1, NodeJS, ExpressJS, Socket.io, and the Twitter Streaming API. JavaScript and jQuery mostly aided AngularJS, as well as helped with some visual effects. Socket.io allowed me
to receive the tweets as they came in to the server through the streaming API instead of all at once. NodeJS was my server-side language, and it was turned into a web framework via ExpressJS.