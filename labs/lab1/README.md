# jonesc11 - Lab 1 - Tweet Ticker - Web Science Systems Development

The purpose of this application is to load static data from a JSON file and load it into a tweet ticker. It was implemented using basic web tools listed below.

## Installation

Copy the index.html file and the resources folder (maintaining structure) into a directory hosted by an Apache server. Connect to the Apache server using a web browser. Verified working browsers are Firefox 58.0, Chrome 63.0, Opera 50, and Edge 41.

## Design Decisions

I decided to remove and add 1 tweet every 3 seconds than do some sort of complete change-out of all five tweets because I felt like the user would feel rushed if five tweets disappeared at a time.

When a user's image could not be found, I replaced it with the default Twitter user image. I did this because they user's don't necessarily need to know if the "tweeter" has an image or not, they just want the tweet information and who it's by. Since this 
application is also running on a static document of old data, there are likely some accounts that have shut down. I did nothing to see if these accounts were still active because again, the tweets are old, but we just want the tweet information, not necessarily 
current tweets. Also, I still linked to the accounts regardless of this, and that way the user would know if the account was still active or not (and they can look into more tweets based on that).

## Tools

For this project, I used HTML5, CSS3, JavaScript, Bootstrap 4, and jQuery 3.2.1. All are included in the website's file structure with no outside links.