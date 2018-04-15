# jonesc11 - Lab 8 - Putting it all together - Web Science Systems Development

The purpose of this lab was to create a full-blown web application out of the previous labs, including a landing page and more well-thought-out
designs.

## Installation

Move this folder somewhere on your computer. In a command prompt, navigate to inside of this folder, and type either "npm start" or "node app.js".
Then, in a web browser, navigate to http://localhost:3000. Verified working browsers are Firefox 58.0, Chrome 63.0, Opera 50, and Edge 41.

## Design Decisions

I decided to use the same code and styles as in lab 7 to save time, and the code worked well enough that it wasn't an issue.

I implemented a full-blown (sort of) log in system. This way, it makes it easier for individual users to get their own tweets. It isn't the best
login system I ever made, but it served the purpose well enough for the time that I had to complete it.

I allowed users to actually download the files this time as opposed to just creating the file on the server side. This is because this application
was built to be much more robust and user-oriented, and therefore I felt like it was worth the extra time to implement it.

Although my keys are available for you (the grader) to see, that is still a server-side script, so they are safe from prying eyes.

I chose to use AngularJS instead of Angular 2, 4, or 5 because that is the Angular framework I am most familiar with.

## Tools

For this project, I used HTML5, CSS3, JavaScript, Bootstrap 4, AngularJS, jQuery 3.2.1, NodeJS, ExpressJS, Socket.io, fast-csv, js2xmlparser,
MongoDB, PassportJS, Express Sessions, and the Twitter Streaming API. JavaScript and jQuery mostly aided AngularJS, as well as helped with some
visual effects. Socket.io allowed me to receive the tweets as they came in to the server through the streaming API instead of all at once. NodeJS
was my server-side language, and it was turned into a web framework via ExpressJS. MongoDB for NodeJS helped me load the tweets into a MongoDB
database.
