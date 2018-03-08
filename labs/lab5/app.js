//- Require and include all variables
var express = require ('express');
var app = express ();
var path = require ('path');
var bodyParser = require ('body-parser');
var Twitter = require ('twitter');
var server = require ('http').Server (app);
var io = require ('socket.io')(server);
var fs = require ('fs');

//- Initialize arrays
var tweets = [];
var connections = [];

//- Create twitter client
var twitterClient = new Twitter ({
  consumer_key: 'ad1s2P5jttVcaXr2H2W482jkh',
  consumer_secret: 'MwyoRXnyVP6MTZ9xIBLEBKuALv5eZrFZH2CJz7FROjYrp3U3L1',
  access_token_key: '734721940385062914-pzv4zw4gkr8Mu7NOislpKAPH6GbbsBc',
  access_token_secret: 'gITrhbyE5bRuo55YBj7WYKr6QxbVtoaua3X4lphW8gIm3'
});

app.use (express.static(path.join(__dirname, 'public')));
app.use (bodyParser.json());

//- Serve homepage
app.get ('/', function (req, res) {
  res.sendFile (__dirname + "/pages/index.html");
});

//- Create socket handler
io.on ('connection', function (socket) {
  //- Add connection to array
  connections.push (socket);
  
  //- Disconnect - remove connection from array
  socket.on ('disconnect', function (data) {
    connections.splice (connections.indexOf (socket), 1);
  });
  
  //- When the client-side socket requests tweets...
  socket.on ('reqTweets', function (data) {
    //- If no filter is defined, create location filter
    if (data.filter.locations === undefined && data.filter.track === undefined && data.filter.follow === undefined )
      data.filter = {locations: "-73.68,42.72,-73.67,42.73"};
    
    //- Create twitter stream
    if (data.filter.follow !== undefined) {
      //- Requires user lookup - can't take screenname, takes ID.
      twitterClient.get ('users/lookup', {screen_name: data.filter.follow}, function (error, returnData, response) {
        data.filter.follow = returnData[0].id;
        streamTweets (data, socket);
      });
    } else {
      streamTweets (data, socket);
    }
  });
});

//- Listen on port 3000
server.listen (3000);

//- Function that starts the tweet stream and sends tweets to the client, given the socket and the data from the client's request
function streamTweets (data, socket) {
  twitterClient.stream ('statuses/filter', data.filter, function (stream) {
    //- To increment every time we get a tweet (so we can stop it when we need to)
    var counter = 0;
    
    stream.on ('data', function (tweet) {
      //- If it's a tweet and not just a connection test
      if (tweet.user !== undefined) {
        //- Add the tweet to the array of tweets
        tweets.push (tweet);
        counter++;
        
        //- Send the tweet to the client
        socket.emit ('newTweet', tweet);
        
        //- Exit when we've collected the correct number of tweets and save the data
        if (counter == data.number) {
          stream.destroy ();
          saveTweets ();
        }
      }
    });
    
    //- Log any errors
    stream.on ('error', function (error) {  
      console.log (error);
    });
  });
}

function saveTweets () {
  var json = JSON.stringify (tweets);
  fs.writeFile ('TwitterTweets17.json', json, function (err) {
    if (err)
      throw err;
  });
}