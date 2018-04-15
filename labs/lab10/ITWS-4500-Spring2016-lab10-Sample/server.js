var express = require('express'),
	twitter = require('ntwitter'),
	mongo = require('mongodb'),
	// host = "127.0.0.1",
	// port = "27017",
	http = require('http'),
	fs = require('fs'),
	app = express(),
	server = http.createServer(app),
	io = require('socket.io').listen(server),
	host="127.0.0.1",
	dbport=mongo.Connection.DEFAULT_PORT;
	var port = process.env.PORT || 3000;
	
	server.listen(port, function() {
		console.log("Listening on " + port);
	});

//DATABASE MONGODB
var MongoClient = require('mongodb').MongoClient;
var tweets;
MongoClient.connect('mongodb://127.0.0.1:27017/exampleDB', function(err, db) {
	if(!err) console.log('we are connected');
	tweets = db.collection('tweet');
});


//APP LOGIC

var twitter = require('ntwitter');

var twit = new twitter({
  //Fill in these values before starting the application
  consumer_key: 'V9LlcrBnYkN2aNNEcPZIug',
  consumer_secret: 'FOeCACbdZU6b8dAhvwdgEXSdeKTLe9zDka1gfzmexs',
  access_token_key: '2225748734-gnp0YdhaulqOTspywdVLuaYtmGGQHpmenmQ68nD',
  access_token_secret: 'DruG5AOQXmHGBYov7ArhkeAfXkIwM7NI4DLFynZenOJez'
});



var i=0, count = 1;
//sourceCount legend [web, iPhone, Android, Blackberry, other]
var sourceCount = [0, 0, 0, 0, 0];

twit.stream('statuses/sample', function(stream) {
  stream.on('data', function (data) {
  	if (i<count){
      //insert tweet object into the mongoDB
  		tweets.insert(data, function(err, result) {});
  		i++;
    }
    else if( i == count){
    	//Query the tweets from the DB
        tweets.find().toArray(function(err, docs) {
          docs.forEach(function(doc) {
            sourceCounter(doc.source);
          });
          console.log("Count: " + sourceCount);
        });

    	i++;
    }
  });
});

function sourceCounter(source){
	//if source contains web, iPhone, Android, Blackberry then increment the 
	//repective source by 1
	if(source.indexOf("web") != -1) sourceCount[0]++ ;
	else if(source.indexOf("iPhone") != -1) sourceCount[1]++ ;
	else if(source.indexOf("Android") != -1) sourceCount[2]++ ;
	else if(source.indexOf("BlackBerry") != -1) sourceCount[3]++ ;
	else sourceCount[4]++;
}






//ROUTERS
app.get('/getSourceCount',function (req, res) {
    res.json(sourceCount);
});

app.get('/',function(req,res){
	res.sendfile(__dirname + '/index.html');
});

app.get('/css/:filename',function(req,res){
	var filename = req.params.filename;
	res.sendfile(__dirname + '/css/' + filename);
});

app.get('/js/:jsname',function(req,res){
	var jsname = req.params.jsname;
	res.sendfile(__dirname + '/js/' + jsname);
});
