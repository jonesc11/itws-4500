//- Initialize application
var twitterApp = angular.module ('twitterApp', []);
var socketKey = -1;
var searchResults = [];

twitterApp.controller ('LoginController', function ($scope) {
  $scope.links = [
    { link: '/', title: 'Home' },
    { link: '/login', title: 'Login' },
    { link: '/signup', title: 'Sign Up' }
  ];
});

twitterApp.controller ('IndexController', function ($scope, $http) {
  $http({
    url: '/is-logged-in',
    method: 'GET'
  }).then (function (data) {
    if (data.data.username) {
      $scope.loggedIn = true;
      $scope.links = [
        { link: '/', title: 'Home' },
        { link: '/ticker', title: 'Create New Search' },
        { link: '/mongo', title: 'View Past Searches' }
      ];
    } else {
      $scope.loggedIn = false;
      $scope.links = [
        { link: '/', title: 'Home' },
        { link: '/login', title: 'Login' },
        { link: '/signup', title: 'Sign Up' }
      ];
    }
  });
});

twitterApp.controller ('MongoController', function ($scope, $http) {
  $scope.links = [
    { link: '/', title: 'Home' },
    { link: '/ticker', title: 'Create New Search' },
    { link: '/mongo', title: 'View Past Searches' }
  ];

  $http({
    method: 'GET',
    url: '/is-logged-in'
  }).then (function (response) {
    $scope.username = response.data.username;
  });

  $http({
    method: 'GET',
    url: '/get-searches'
  }).then (function (response) {
    $scope.searches = response.data;
    for (var i = 0; i < $scope.searches.length; ++i) {
      var d = new Date($scope.searches[i].createdTime);
      $scope.searches[i].date = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
      $scope.searches[i].filters = '';
      if ($scope.searches[i].filter.locations)
        $scope.searches[i].filters += 'location ' + $scope.searches[i].filter.locations + ' ';
      if ($scope.searches[i].filter.follow)
        $scope.searches[i].filters += 'user ' + $scope.searches[i].filter.follow + ' ';
      if ($scope.searches[i].filter.track)
        $scope.searches[i].filters += 'query ' + $scope.searches[i].filter.track + ' ';
    }
  });

  $scope.tweets = [];
  $scope.searchesShow = true;
  $scope.onClick = function () {
    $scope.searchesShow = false;
    $scope.tweets = this.search.tweets;
  };
});

twitterApp.controller ('TickerController', function ($scope, $http) {
  //- Create function in the scope for when the submit button is clicked
  var socket = io('http://localhost:3000');
  var tweetCounter = 0;
  var tweetMax = -1;

  $http({
    method: 'GET',
    url: '/is-logged-in'
  }).then (function (response) {
    $scope.username = response.data.username;
  });

  $scope.downloadDisabled = true;

  $scope.links = [
    { link: '/', title: 'Home' },
    { link: '/ticker', title: 'Create New Search' },
    { link: '/mongo', title: 'View Past Searches' }
  ];

  $scope.resetForm = function () {
    $scope.number = 10;
    $scope.locationCheck = false;
    $scope.swlon = "";
    $scope.swlat = "";
    $scope.nelon = "";
    $scope.nelat = "";
    $scope.userCheck = false;
    $scope.tweeter = "";
    $scope.otherCheck = "";
    $scope.query = "";
  };

  $scope.resetForm();
  
  $scope.onSubmit = function () {
    var toEmit = {};
    
    toEmit.number = $scope.number;
    toEmit.filter = {};
    
    //- Parse the filters
    if ($scope.locationCheck)
      toEmit.filter.locations = $scope.swlon + ',' + $scope.swlat + ',' + $scope.nelon + ',' + $scope.nelat;
    if ($scope.otherCheck)
      toEmit.filter.track = $scope.query;
    if ($scope.userCheck)
      toEmit.filter.follow = $scope.tweeter;
    
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
    toEmit.format = $scope.export;
    toEmit.username = $scope.username;
    
    //- Send out the data to the server and update the tweet box
    socket.emit('reqTweets', toEmit);
    $("#tweetwell").html('<h3 class="waiting">Filtered by: ' + filter + '</h3>');
    
    //- Reset counters and disable the tweet scrape button
    tweetMax = toEmit.number;
    tweetCounter = 0;
    $('#scrape-button').prop ('disabled', true);
  };

  $scope.download = function () {
    socket.emit('reqRecentFile', { format: $scope.export });
  };

  socket.on ('fileDownload', function (data) {
    $scope.toJSON = '';
    $scope.toJSON = data.data;
    var blob = new Blob([$scope.toJSON], { type:"application/" + data.type + ";charset=utf-8;" });
    var downloadLink = angular.element('<a></a>');
    var url = window.URL.createObjectURL(blob);
    downloadLink.attr('href', url);
    downloadLink.attr('download', 'tweets.' + data.type);
    $('body').append(downloadLink[0]);
    downloadLink[0].click();
    $('body').remove(downloadLink[0]);
  });
 
  //- When a new tweet comes in, load the tweet, increment the counter, and re-enable the button if appropriate
  socket.on ('newTweet', function (data) {
    $('#tweetwell').append (createTweet (data));
    tweetCounter++;
    if (tweetCounter == tweetMax) {
      $('#scrape-button').prop ('disabled', false);
      $scope.downloadDisabled = false;
    }
  });

  socket.on ('searchReturn', function (data) {
    searchResults = data;
    var newhtml = '<div class="search-results">';

    for (var i = 0; i < data.length; ++i) {
      var date = new Date (data[i].createdTime);
      newhtml += '<div class="single-result" objectid="' + data[i]._id + '">';
      newhtml += '<h5>Search at ' + date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + '</h5>';
      newhtml += '<p>Filters: '
      if (data[i].filter.locations)
        newhtml += 'location ' + data[i].filter.locations + ' ';
      if (data[i].filter.follow)
        newhtml += 'user ' + data[i].filter.follow + ' ';
      if (data[i].filter.track)
        newhtml += 'query ' + data[i].filter.track;
      newhtml += '</p></div>';
    }

    newhtml += '</div>';
    $('.modal-body').html(newhtml);

    $('.single-result').on ('click', function () {
      var objectid = $(this).attr('objectid');

      for (var i = 0; i < searchResults.length; ++i) {
        if (searchResults[i]._id === objectid) {
          var tweets = '<div class="modaltweets">';

          for (var j = 0; j < searchResults[i].tweets.length; ++j) {
            tweets += '<div class="modaltweet">';
            tweets += '<strong><a href="http://twitter.com/' + searchResults[i].tweets[j].user_screen_name + '" title="View user page">@' + searchResults[i].tweets[j].user_screen_name + '</a></strong> ';
            tweets += searchResults[i].tweets[j].text;
            tweets += '</div>';
          }

          tweets += '</div>';

          $('.modal-body').html(tweets);
        }
      }
    });
  });
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
