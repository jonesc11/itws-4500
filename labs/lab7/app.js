//- Require and include all variables
var express = require ('express');
var app = express ();
var path = require ('path');
var bodyParser = require ('body-parser');
var Twitter = require ('twitter');
var server = require ('http').Server (app);
var io = require ('socket.io')(server);
var fs = require ('fs');
var csv = require ('fast-csv');
var xml = require ('js2xmlparser');
var mongodb = require ('mongodb').MongoClient;

//- Initialize arrays
var tweets = {};
var connections = [];
var savedRequests = {};

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
  tweets[socket.conn.id] = [];
  
  //- Disconnect - remove connection from array
  socket.on ('disconnect', function (data) {
    connections.splice (connections.indexOf (socket), 1);
    delete tweets[socket.conn.id];
  });
  
  //- When the client-side socket requests tweets...
  socket.on ('reqTweets', function (data) {
    //- If no filter is defined, create location filter
    if (data.filter.locations === undefined && data.filter.track === undefined && data.filter.follow === undefined )
      data.filter = {locations: "-73.68,42.72,-73.67,42.73"};
    
    tweets[socket.conn.id] = [];
    
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

  socket.on ('oldTweets', function (data) {
    returnTweets (data, socket);
  });
});

//- Listen on port 3000
server.listen (3000);

function returnTweets (data, socket) {
  mongodb.connect ('mongodb://localhost:27017/', function (err, db) {
    if (err)
      throw err;
    var database = db.db("tweets");
    database.collection("searches").find ({ username: data.username }).toArray (function (err, data) {
      socket.emit ('searchReturn', data);
    });
  });
}

//- Function that starts the tweet stream and sends tweets to the client, given the socket and the data from the client's request
function streamTweets (data, socket) {
  twitterClient.stream ('statuses/filter', data.filter, function (stream) {
    //- To increment every time we get a tweet (so we can stop it when we need to)
    var counter = 0;
    
    stream.on ('data', function (tweet) {
      //- If it's a tweet and not just a connection test
      if (tweet.user !== undefined) {
        //- Add the tweet to the array of tweets
        tweets[socket.conn.id].push (tweet);
        counter++;
        
        //- Send the tweet to the client
        socket.emit ('newTweet', tweet);
        
        //- Exit when we've collected the correct number of tweets and save the data
        if (counter == data.number) {
          stream.destroy ();
          saveTweets (data.format, socket);
          saveToMongo (data, socket);
        }
      }
    });
    
    //- Log any errors
    stream.on ('error', function (error) {  
      console.log (error);
    });
  });
}

function saveToMongo (data, socket) {
  var newObject = {
    createdTime: Date.now(),
    username: data.username,
    filter: data.filter,
    tweets: getNewObjects (socket)
  };

  mongodb.connect ('mongodb://localhost:27017/', function (err, db) {
    if (err)
      throw err;
    var database = db.db("tweets");
    database.collection("searches").insertOne (newObject, function (err, res) {
      if (err)
        throw err;
      console.log ("Saved to database.");
      db.close();
    });
  });
}

function getNewObjects (socket) {
  var newObject = [];
  
  //- Parse the old data into a newer, cleaner object
  for (var i = 0; i < tweets[socket.conn.id].length; ++i) {
    value = tweets[socket.conn.id][i];
    var toAppend = {
      created_at: value.created_at,
      id: value.id,
      text: value.text,
      user_id: value.user.id,
      user_name: value.user.name,
      user_screen_name: value.user.screen_name,
      user_location: value.user.location,
      user_followers_count: value.user.followers_count,
      user_friends_count: value.user.friends_count,
      user_created_at: value.user.created_at,
      user_time_zone: value.user.time_zone,
      user_profile_background_color: value.user.profile_background_color,
      user_profile_image_url: value.user.profile_image_url,
      place: value.place.full_name
    };
    
    //- Get coordinates
    if (value.geo !== null)
      toAppend.geo = value.geo.coordinates[0] + ',' + value.geo.coordinates[1];
    else
      toAppend.geo = null;
    if (value.coordinates !== null)
      toAppend.coordinates = value.coordinates.coordinates[0] + ',' + value.coordinates.coordinates[1];
    else
      toAppend.coordinates = null;
    
    newObject.push (toAppend);
  }
  
  return newObject;
}

function saveTweets (type, socket) {
  if (type === 'json') {
    //- Write to a JSON file
    fs.writeFile ('TwitterTweets17.json', JSON.stringify (getNewObjects (socket)), function (err) {
      if (err)
        throw err;
    });
  } else if (type === 'csv') {
    //- Write to CSV
    var newObject = getNewObjects (socket);
    
    //- Create header row
    var csvArray = [["created_at",
                     "id",
                     "text",
                     "user_id",
                     "user_name",
                     "user_screen_name",
                     "user_location",
                     "user_followers_count",
                     "user_friends_count",
                     "user_created_at",
                     "user_time_zone",
                     "user_profile_background_color",
                     "user_profile_image_url",
                     "geo",
                     "coordinates",
                     "place"]];
    
    //- Load all other data
    for (var i = 0; i < newObject.length; ++i) {
      var tweet = newObject[i];
      csvArray.push ([
        tweet.created_at,
        tweet.id,
        tweet.text,
        tweet.user_id,
        tweet.user_name,
        tweet.user_screen_name,
        tweet.user_location,
        tweet.user_followers_count,
        tweet.user_friends_count,
        tweet.user_created_at,
        tweet.user_time_zone,
        tweet.user_profile_background_color,
        tweet.user_profile_image_url,
        tweet.geo,
        tweet.coordinates,
        tweet.place
      ]);
    }
    
    //- Write to file
    csv.writeToString(csvArray, {headers: true}, function (err, data) {
      fs.writeFile ('TwitterTweets17.csv', data, function (err) {
        if (err)
          throw err;
      });
    });
  } else if (type === 'xml') {
    //- Write to XML
    var newObject = getNewObjects (socket);
    var object = {
      "tweet": []
    }

    //- Load new data for the XML file format
    for (var i = 0; i < newObject.length; ++i) {
      var tweet = newObject[i];
      var nextFormat = {};
      nextFormat.user = {};

      if (tweet.created_at)
        nextFormat.createdAt = tweet.created_at;
      if (tweet.id)
        nextFormat.id = tweet.id;
      if (tweet.text)
        nextFormat.content = tweet.text;
      if (tweet.geo)
        nextFormat.geo = tweet.geo;
      if (tweet.coordinates)
        nextFormat.coordinates = tweet.coordinates;
      if (tweet.place)
        nextFormat.place = tweet.place;
      if (tweet.user_id)
        nextFormat.user.id = tweet.user_id;
      if (tweet.user_name)
        nextFormat.user.name = tweet.user_name;
      if (tweet.user_screen_name)
        nextFormat.user.screenName = tweet.user_screen_name;
      if (tweet.user_location)
        nextFormat.user.location = tweet.user_location;
      if (tweet.user_followers_count)
        nextFormat.user.followers = tweet.user_followers_count;
      if (tweet.user_friends_count)
        nextFormat.user.friends = tweet.user_friends_count;
      if (tweet.user_created_at)
        nextFormat.user.createdAt = tweet.user_created_at;
      if (tweet.user_time_zone)
        nextFormat.user.timeZone = tweet.user_time_zone;
      if (tweet.user_profile_background_color)
        nextFormat.user.profileBackgroundColor = tweet.user_profile_background_color;
      if (tweet.user_profile_image_url)
        nextFormat.user.profileImageUrl = tweet.user_profile_image_url;
      object.tweet.push (nextFormat);
    }

    //- Write to file
    fs.writeFile ('TwitterTweets17.xml', xml.parse('tweets', object), function (err) {
      if (err)
        console.log (err);
    });
  }
}
