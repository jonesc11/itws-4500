var tweetlist = [];
var popularHashtags = [];

$(document).ready(function() {
  //- Get the JSON object and load everything
  $.getJSON("/resources/json/TwitterTweets17.json", function(data) {
    loadData(data);
    
    //- Clear the initial box that says "No data found" (so that users don't just see nothing).
    $("#tweet-box").html("");
    
    //- Load the initial tweets
    for (var i = 0; i < 5 && i < tweetlist.length; ++i) {
      $("#tweet-box").append(createTweet(tweetlist[i]));
    }
    
    //- Start the loop to cycle through tweets
    runScript(5);
  });
});

//- Actually runs the tweet ticker - Shows and hides tweets every 3 seconds
function runScript(counter) {
  //- setTimeout allows it to run infinitely without a while true loop
  setTimeout(function() {
    //- Hide top tweet
    var rem = document.getElementById("tweet-box").getElementsByClassName("tweet");
    $(rem[0]).hide(300);
    
    //- If we have run out of tweets, show a generic tweet
    if (counter < tweetlist.length) {
      var newTweet = createTweet(tweetlist[counter]);
      
      //- Add the new tweet with display none and the show it (with animation)
      newTweet.setAttribute("style", "display:none;");
      $("#tweet-box").append(newTweet);
      $(newTweet).show(300);
    } else {
      //- Creates a generic tweet element
      var div = document.createElement("div");
      div.setAttribute("class", "tweet");
      var p = document.createElement("p");
      p.setAttribute("class", "none");
      p.innerHTML = "No tweet found.";
      div.appendChild(p);
      $("#tweet-box").append(div);
    }
    
    //- After the animation has finished, remove the tweet that was first.
    setTimeout(function() {
      $(rem[0]).remove();
    }, 300);
    
    //- Increment the counter and add another tweet
    counter++;
    runScript(counter);
  }, 3000);
}

//- Returns a div of the properly formatted tweet with the specified parameters.
function createTweet(tweetObject) {
  //- Load the object from the tweet data in to easier-to-use variables
  var tLink = tweetObject.userImage;
  var tUser = tweetObject.user;
  var tTweet = tweetObject.tweet;
  var tLikes = tweetObject.likes;
  var tRetweets = tweetObject.retweets;
  
  //- Get, in order, all of the tweets and hashtags for this tweet
  var entities = tweetObject.hashtags.concat(tweetObject.mentions);
  var prioritizedEntities = [];
  
  while (entities.length > 0) {
    var firstObject = -1;
    var earliestIndex = 1000; //- A tweet is only 140 characters so this is sufficiently large
    
    //- Simple max function
    for (var i = 0; i < entities.length; ++i) {
      value = entities[i];
      if (value.indices[0] < earliestIndex) {
        earliestIndex = value.indices[0];
        firstObject = i;
      }
    }
    prioritizedEntities.push(entities[firstObject]);
    entities.splice(firstObject, 1);
  }
  
  //- Master element
  var tweet = document.createElement("div");
  tweet.setAttribute("class", "tweet");
  
  //- Create image and check if it's an error
  var imgDiv = document.createElement("div");
  imgDiv.setAttribute("class", "image");
  var imgLink = document.createElement("a");
  imgLink.setAttribute("href", "http://www.twitter.com/" + tUser);
  imgLink.setAttribute("title", "Visit " + tUser + "'s page");
  var img = document.createElement("img");
  img.setAttribute("src", tLink);
  img.onerror = function() {
    this.src = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";
  };
  
  imgLink.appendChild(img);
  imgDiv.appendChild(imgLink);
  tweet.appendChild(imgDiv);
  
  var textDiv = document.createElement("div");
  textDiv.setAttribute("class", "tweet-text");
  
  //- Add anchor tags to hashtags and mentions
  var currentIndex = 0;
  var fullTweet = "";
  $.each(prioritizedEntities, function(key, value) {
    //- Determine if it's a user or a hashtag
    if (typeof value['screen_name'] !== "undefined") {
      fullTweet += tTweet.substring(currentIndex, value.indices[0]);
      fullTweet += "<a href=\"http://twitter.com/" + value.screen_name + "\" title=\"View " + value.screen_name + "'s profile\">" + tTweet.substring(value.indices[0], value.indices[1]) + "</a>";
    } else {
      fullTweet += tTweet.substring(currentIndex, value.indices[0]);
      fullTweet += "<a href=\"http://twitter.com/hashtag/" + value.text + "\" title=\"View the hashtag #" + value.text + "\">" + tTweet.substring(value.indices[0], value.indices[1]) + "</a>";
    }
    currentIndex = value.indices[1];
  });
  fullTweet += tTweet.substring(currentIndex, tTweet.length);
  
  //- Create tweet
  var tweetTag = document.createElement("p");
  tweetTag.innerHTML = "<a href=\"http://www.twitter.com/" + tUser + "\" title=\"View " + tUser + "'s profile\" class=\"tweeter\">" + tweetObject.name + ": @" + tUser + "</a> " + fullTweet + "<br />";
  textDiv.appendChild(tweetTag);
  
  //- Create likes and retweets
  var LRT = document.createElement("p");
  LRT.setAttribute("class", "lrt");
  LRT.innerHTML = tLikes + " Likes, " + tRetweets + " Retweets";
  textDiv.appendChild(LRT);
  
  tweet.appendChild(textDiv);
  
  return tweet;
}

//- Loads all the JSON data (data) into two global variables (popular hashtags and tweetlist)
//- Also populate the popular hashtags field in HTML.
function loadData(data) {
  var hashtagCounts = {};
  for (var k = 0; k < data.length; ++k) {
    var value = data[k];
    var newObject = {};
    
    //- Filter out the objects that aren't tweets
    if (typeof value.text === 'undefined') continue;
    
    //- Load only the needed data into a new object
    newObject.tweet = value.text;
    newObject.user = value['user']['screen_name'];
    newObject.name = value['user']['name'];
    newObject.userImage = value['user']['profile_image_url'];
    newObject.likes = value['favorite_count'];
    newObject.retweets = value['retweet_count'];
    newObject.hashtags = value['entities']['hashtags'];
    newObject.mentions = value['entities']['user_mentions'];
    
    //- Add the new object 
    tweetlist.push(newObject);
    
    //- Add to the hashtag counters
    if (typeof value.entities !== 'undefined' && typeof value.entities.hashtags !== 'undefined') {
      var hashtags = value.entities.hashtags;
      $.each(hashtags, function(i, v) {
        if (typeof hashtagCounts[v.text.toUpperCase()] === 'undefined') {
          hashtagCounts[v.text.toUpperCase()] = 1;
        } else {
          hashtagCounts[v.text.toUpperCase()]++;
        }
      });
    }
  }
  
  //- Get the maximum of each of the tweets and add it to the popular hashtags section (do this 5 times).
  for (var i = 0; i < 5; ++i) {
    var maxCount = -1;
    var maxTag = '';
    
    $.each(hashtagCounts, function(hashtag, count) {
      if (count > maxCount) {
        maxTag = hashtag;
        maxCount = count;
      }
    });
    
    $("#hashtag-" + i).html("#" + maxTag);
    $("#hashtag-" + i).attr("href", "http://twitter.com/hashtag/" + maxTag);
    delete hashtagCounts[maxTag];
  }
}