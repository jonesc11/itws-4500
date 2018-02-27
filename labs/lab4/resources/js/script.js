//- Initialize application
var weatherApp = angular.module ('weatherApp', ['ngRoute']);
var weatherData = [];

//- Set up routing for different pages
weatherApp.config (['$routeProvider', function ($routeProvider) {
  //- Show certain templates based on the path
  $routeProvider
    .when ('/', {
      controller: 'HomeController',
      templateUrl: 'views/homeview.html'
    })
    .when ('/weather/:id', {
      controller: 'WeatherController',
      templateUrl: 'views/weather.html'
    })
    .otherwise ({redirectTo: '/'});
}]);

//- Fix the annoying URLs
weatherApp.config (['$locationProvider', function ($locationProvider) {
  $locationProvider.hashPrefix(['']);
}]);

//- Initializes the rootScope variables (i.e. the menu icons)
weatherApp.run (function ($rootScope, $http) {
  $rootScope.links = [];
  
  //- Only display current location if current location is enabled.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      longitude = position.coords.longitude;
      latitude  = position.coords.latitude;
      
      $http.get("http://api.openweathermap.org/data/2.5/weather?lat="+ latitude + "&lon=" + longitude + "&units=imperial&APPID=547a28a0d7cf9e5e3445130e6081b8d1")
        .then (function (data) {
          addWeather (data.data);
          
          $rootScope.links.push({ 'href': '#/weather/0', 'view': 'Current Location' });
        }
      );
    });
  }
});

//- Controller for the homepage
weatherApp.controller ('HomeController', function ($scope, $rootScope, $http, $location) {
  $scope.onSubmit = function () {
    var zipcode = $("input[name=zipcode]").val();
    
    //- Clear previous errors
    $("#errors").html("");
    
    //- Error checking
    if ($.isNumeric(zipcode) === false || zipcode.length !== 5) {
      $("#errors").html("<div class=\"alert alert-danger\"><strong>Invalid Input:</strong> Zip code must be a 5-digit number.</div>");
      return;
    }
    
    //- Make http request and load the data
    $http.get("http://api.openweathermap.org/data/2.5/weather?zip="+ zipcode + ",us&units=imperial&APPID=547a28a0d7cf9e5e3445130e6081b8d1")
      .then (function (data) {
        $rootScope.links.push({ 'href': "#/weather/" + weatherData.length, 'view': addWeather(data.data) });
        
        //- Redirect to the new page
        $location.url('weather/' + (weatherData.length - 1));
      }
    );
  }
});

//- Controller for the weather page (changes based on what's in the address)
weatherApp.controller ('WeatherController', function ($scope, $routeParams, $http) {
  var index = parseInt($routeParams.id);
  var weather = weatherData[index];
  
  //- If you load the page '/weather/0' first, this will not be defined and the page will load incorrectly.
  if (index === 0 && weather === undefined) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        longitude = position.coords.longitude;
        latitude  = position.coords.latitude;
        
        //- Make new http request and display immediately
        $http.get("http://api.openweathermap.org/data/2.5/weather?lat="+ latitude + "&lon=" + longitude + "&units=imperial&APPID=547a28a0d7cf9e5e3445130e6081b8d1")
          .then (function (data) {
            data = data.data;
            weather = {
              'city': data.name,
              'temp': data.main.temp,
              'humidity': data.main.humidity,
              'pressure': data.main.pressure,
              'windSpeed': data.wind.speed,
              'windDir': data.wind.deg,
              'weather': data.weather[0]
            };
            
            weather.windDir = getWindDirection (weather.windDir);
            
            $scope.weather = weather;
          }
        );
      });
    }
  } else {
    $scope.weather = weather;
  }
});

//- Adds the weather from the AJAX request to the array
function addWeather (data) {
  var newWeather = {
    'city': data.name,
    'temp': data.main.temp,
    'humidity': data.main.humidity,
    'pressure': data.main.pressure,
    'windSpeed': data.wind.speed,
    'windDir': data.wind.deg,
    'weather': data.weather[0]
  };
  
  newWeather.windDir = getWindDirection (newWeather.windDir);
  
  weatherData.push (newWeather);
  
  return data.name;
}

//- Given degrees, it returns the wind's direction in either 1 or 2 characters
function getWindDirection (degrees) {
  var windDirection = "N";
  if (degrees > 22.5 || degrees <= 67.5)
    windDirection = "NE";
  if (degrees > 67.5 || degrees <= 112.5)
    windDirection = "E";
  if (degrees > 112.5 || degrees <= 157.5)
    windDirection = "SE";
  if (degrees > 157.5 || degrees <= 202.5)
    windDirection = "S";
  if (degrees > 202.5 || degrees <= 247.5)
    windDirection = "SW";
  if (degrees > 247.5 || degrees <= 292.5)
    windDirection = "W";
  if (degrees > 292.5 || degrees <= 337.5)
    windDirection = "NW";
  
  return windDirection
}