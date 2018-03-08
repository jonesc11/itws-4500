//- Initialize application
var twitterApp = angular.module ('twitterApp', []);
var socketKey = -1;

twitterApp.controller ('MainController', function ($scope) {
  //- Create function in the scope for when the submit button is clicked
  var socket = io('http://localhost:3000');
  var tweetCounter = 0;
  var tweetMax = -1;
  
  $scope.onSubmit = function () {
    var toEmit = {};
    
    toEmit.number = $('input[name=number]').val();
    toEmit.filter = {};
    
    //- Parse the filters
    if ($('input[name=location]').prop('checked') === true)
      toEmit.filter.locations = $('input[name=sw-lon]').val() + ',' + $('input[name=sw-lat]').val() + ',' + $('input[name=ne-lon]').val() + ',' + $('input[name=ne-lat]').val();
    if ($('input[name=other]').prop('checked') === true)
      toEmit.filter.track = $('input[name=query]').val();
    if ($('input[name=user]').prop('checked') === true)
      toEmit.filter.follow = $('input[name=tweeter]').val();
    
    //- Create the filter string that appears above the loaded tweets
    var filter = '';
    if (toEmit.filter.locations !== undefined) {
      filter += 'location';
      if (toEmit.filter.follow !== undefined)
        filter += ', user';
      if (toEmit.filter.track !== undefined)
        filter += ', keywords';
    } else if (toEmit.filter.follow !== undefined) {
      filter += 'user';
      if (toEmit.filter.track !== undefined)
        filter += ', keywords';
    } else if (toEmit.filter.track !== undefined) {
      filter += 'keywords'
    }
    
    //- This means the tweets are filtered using the default locations
    if (toEmit.filter.locations === undefined && toEmit.filter.follow === undefined && toEmit.filter.track === undefined) {
      filter += 'location';
    }
    
    //- Also emit the type of file we want to export to
    toEmit.format = $('select[name=export]').val();
    
    //- Send out the data to the server and update the tweet box
    socket.emit('reqTweets', toEmit);
    $("#tweetwell").html('<h3 class="waiting">Filtered by: ' + filter + '</h3>');
    
    //- Reset counters and disable the tweet scrape button
    tweetMax = toEmit.number;
    tweetCounter = 0;
    $('#scrape-button').prop ('disabled', true);
  }
  
  //- When a button is checked, disable or enable the text fields corresponding to it accordingly
  $scope.onCheck = function (type) {
    //- For location searches
    if (type === 'location') {
      if ($('input[name=location]').prop('checked')) {
        $('input[name=sw-lon]').prop('disabled', false);
        $('input[name=sw-lat]').prop('disabled', false);
        $('input[name=ne-lon]').prop('disabled', false);
        $('input[name=ne-lat]').prop('disabled', false);
      } else {
        $('input[name=sw-lon]').prop('disabled', true);
        $('input[name=sw-lat]').prop('disabled', true);
        $('input[name=ne-lon]').prop('disabled', true);
        $('input[name=ne-lat]').prop('disabled', true);
      }
    }
    
    //- For searches by handle
    if (type === 'user') {
      if ($('input[name=user]').prop('checked')) {
        $('input[name=tweeter]').prop('disabled', false);
      } else {
        $('input[name=tweeter]').prop('disabled', true);
      }
    }
    
    //- For keyword searches
    if (type === 'other') {
      if ($('input[name=other]').prop('checked')) {
        $('input[name=query]').prop('disabled', false);
      } else {
        $('input[name=query]').prop('disabled', true);
      }
    }
  };
  
  //- When a new tweet comes in, load the tweet, increment the counter, and re-enable the button if appropriate
  socket.on ('newTweet', function (data) {
    $('#tweetwell').append (createTweet (data));
    tweetCounter++;
    if (tweetCounter == tweetMax) {
      $('#scrape-button').prop ('disabled', false);
    }
  });
});

//- When the document loads reset all the fields (this is just copied from lab 1)
$(document).ready (function () {
  $('input[type=text]').prop('disabled', true);
  $('input[type=text]').val('');
  $('input[type=checkbox]').prop('checked', false);
  $('input[type=number]').val(10);
});

//- Returns a div of the properly formatted tweet with the specified parameters.
function createTweet(tweetObject) {
  //- Load the object from the tweet data in to easier-to-use variables
  var tLink = tweetObject.user.profile_image_url;
  var tUser = tweetObject.user.screen_name;
  var tTweet = tweetObject.text;
  if (tweetObject.retweeted_status !== undefined) {
    if (tweetObject.retweeted_status.extended_tweet !== undefined) {
      tTweet = 'RT @' + tweetObject.retweeted_status.user.screen_name + ': ' + tweetObject.retweeted_status.extended_tweet.full_text;
    } else {
      tTweet = 'RT @' + tweetObject.retweeted_status.user.screen_name + ': ' + tweetObject.retweeted_status.text;
    }
  } else if (tweetObject.extended_tweet !== undefined) {
    tTweet = tweetObject.extended_tweet.full_text;
  }
  if (tweetObject.extended_tweet !== undefined)
    var tTweet = tweetObject.extended_tweet.full_text;
  var tLikes = tweetObject.favorite_count;
  var tRetweets = tweetObject.retweet_count;
  
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
  
  var fullTweet = tTweet.substring(0, tTweet.length);
  
  //- Create tweet
  var tweetTag = document.createElement("p");
  tweetTag.innerHTML = "<a href=\"http://www.twitter.com/" + tUser + "\" title=\"View " + tUser + "'s profile\" class=\"tweeter\">" + tweetObject.user.name + ": @" + tUser + "</a> " + fullTweet + "<br />";
  textDiv.appendChild(tweetTag);
  
  //- Create likes and retweets
  var LRT = document.createElement("p");
  LRT.setAttribute("class", "lrt");
  LRT.innerHTML = tLikes + " Likes, " + tRetweets + " Retweets";
  textDiv.appendChild(LRT);
  
  tweet.appendChild(textDiv);
  
  return tweet;
}