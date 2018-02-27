var express = require ('express');
var request = require ('request');
var bodyParser = require ('body-parser');
var path = require ('path');

app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post ('/submit', function (req, res) {
  var zipcode = req.body.zipcode;
  
  request ("http://api.openweathermap.org/data/2.5/weather?zip="+ zipcode + ",us&units=Metric&APPID=547a28a0d7cf9e5e3445130e6081b8d1", function (error, response, body) {
    var reqJson = JSON.parse (body);
    
    var temp = reqJson.main.temp;
    
    res.send (JSON.stringify({temperature: temp}));
  });
});

app.listen (3000);