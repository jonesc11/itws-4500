# jonesc11 - Lab 4 - Weather Application v2 - Web Science Systems Development

The purpose of this application is to create a web application using AngularJS, Bootstrap, Media Queries, and AJAX that is mobile responsive and uses a streaming API. It was implemented using basic web tools listed below.

## Installation

Move this into some sort of hosted folder on your computer. It does not have to be the root directory of your host. Navigate to wherever you installed it in your web browser. Verified working browsers are Firefox 58.0, Chrome 63.0, Opera 50, and Edge 41.

## Design Decisions

When the page gets too small, the icons in the menu collapse in a not-so-pretty way. Therefore, when the screen got down to Bootstrap XS size, I removed all icons besides home and made them into a list on the homepage. That way, you can still navigate to them,
but it's easier to read.

I used OpenWeatherMap instead of DarkSky because it gave me the town name without using the Google Maps API. DarkSky gave a bit more data per request, but that's the tradeoff I made. It was mostly secondary data like dew point. Additionally, similarly to lab 2,
I left the keys right in the client-side JavaScript because this isn't a production application, and it was easier to do this than to write multiple other scripts to do it for me.

I chose to use AngularJS instead of Angular 2, 4, or 5 because that is the Angular framework I am most familiar with.

## Tools

For this project, I used HTML5, CSS3, JavaScript, Bootstrap 4, AngularJS, and jQuery 3.2.1. I used the OpenWeatherMap API to collect weather data for all locations, displayed it in HTML format with AngularJS, and styled with Bootstrap. JavaScript and jQuery
were primarily used to help with Angular.