# jonesc11 - Lab 2 - Weather Card - Web Science Systems Development

The purpose of this application is to use APIs to pull weather information for a user's location. It was implemented using basic web tools listed below.

## Installation

Copy the index.html file and the resources folder (maintaining structure) into a directory on your computer. Do not host this on some kind of stack, instead, open it from a file (unless you have an SSL certificate), otherwise the geolocation will not work.
Verified working browsers are Firefox 58.0, Chrome 63.0, and Opera 50. On Edge 41, the sections do not collapse. I decided not to accommodate this due to Edge's low user count and all of the data is still there, and not necessarily difficult to read.

## Design Decisions

Although I know this is bad practice, I put the API keys right into the JavaScript file. I did this because there was no other reliable way to get the API data, since the geolocation didn't work when I hosted it on Apache. However, if I could use a stack for this, 
I would need to have an SSL certificate and I would've had some sort of server-side script return the JSON object that Dark Sky and Google Maps returns.

I decided to use details tags for minutely, hourly, and daily information. The good things about details is that, on most browsers, the details sections collapse on their own without any outside JavaScript required. This give users access to the information, but 
they don't have to worry too much about the data being in their way if they don't want to look at a certain type of data.

## Tools

For this project, I used HTML5, CSS3, JavaScript, Bootstrap 4, and jQuery 3.2.1. The APIs I used were the Dark Sky API and the Google Maps API, including the Weather Icons CSS / Font library for the weather icons. All of the Bootstrap and jQuery files are included 
in the website's file structure with no outside links.