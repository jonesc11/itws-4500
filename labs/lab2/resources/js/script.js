$( document ).ready( function () {
  var longitude, latitude;
  
  if ( navigator.geolocation ) {
    navigator.geolocation.getCurrentPosition( function ( position ) {
      longitude = position.coords.longitude;
      latitude = position.coords.latitude;
      
      //- Load the weather card
      loadCard ( longitude, latitude );
    }, function ( error ) {
      //- Handle errors for geolocation
      switch ( error.code ) {
        case error.PERMISSION_DENIED:
          createError ( "Could not load location: User did not allow access to location information." );
          break;
        case error.POSITION_UNAVAILABLE:
          createError ( "Could not load location: Location information unavailable." );
          break;
        case error.TIMEOUT:
          createError ( "Could not load location: Request timeout." );
          break;
        case error.UNKNOWN_ERROR:
          createError ( "Could not load location: Unknown error." );
          break;
      }
    } );
  } else {
    createError ( "Could not load location: User did not allow access to location information." );
  }
} );

function loadCard ( longitude, latitude ) {
  //- I know this is bad practice, but due to complications (explained in the ReadMe) this was necessary.
  var darkSkyKey = "e46dbb1c32146cf725726f21281387f2";
  var googleKey = "AIzaSyCqk1I6OKb3TIVhpiQv4Zu6HPGCXMM00cE";
  
  //- Nested AJAX calls for Dark Sky API and Google Maps API.
  $.getJSON ( "https://api.darksky.net/forecast/" + darkSkyKey + "/" + latitude + "," + longitude + "?callback=?&units=us", function ( darkSkyData ) {
    $.getJSON ( "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + latitude + "," + longitude + "&key=" + googleKey, function ( googleData ) {
      var googleResult = googleData['results'][0]['address_components'];
      var foundCity = false, foundState = false;
      var city = "", state = "";
      
      //- Parse the Google data for the city and state name. If the Google data wasn't good, just set it to "Current Location"
      if ( googleData.status == 'OK' ) {
        $.each ( googleResult, function ( key, value ) {
          if ( $.inArray ( 'locality', value['types'] ) != -1 && !foundCity ) {
            foundCity = true;
            city = value['long_name'];
          }
          
          if ( $.inArray ( 'administrative_area_level_1', value['types'] ) != -1 && !foundState ) {
            foundState = true;
            state = value['short_name'];
          }
        } );
      } else {
        city = "Current Location";
      }
      
      //- Clear the cards div
      $( "#cards" ).html ( "" );
      
      //- Create the new card
      var currentWeather = darkSkyData.currently;
      var ele = document.createElement ( "div" );
      ele.setAttribute ( "class", "weather-card" );
      
      //- Add heading
      var heading = document.createElement ( "h2" );
      heading.setAttribute ( "class", "location" );
      heading.innerHTML = city;
      
      if ( state != "" )
        heading.innerHTML += ", " + state;
      
      $( ele ).append ( heading );
      
      //- Add temperature and feels like
      var temperature = document.createElement ( "div" );
      temperature.setAttribute ( "class", "temperature float-right" );
      
      var realTemp = document.createElement ( "p" );
      realTemp.setAttribute ( "class", "real-temperature" );
      realTemp.innerHTML = currentWeather.temperature + "&#176; F";
      
      var feelsLike = document.createElement ( "p" );
      feelsLike.setAttribute ( "class", "feels-like" );
      feelsLike.innerHTML = "Feels like: " + currentWeather.apparentTemperature + "&#176; F";
      
      $( temperature ).append( realTemp );
      $( temperature ).append( feelsLike );
      
      $( ele ).append ( temperature );
      
      //- Add icon using Weather Icons
      var icon = document.createElement ( "div" );
      icon.setAttribute ( "class", "icon" );
      
      //- Parse the icons to add the appropriate icon from Weather Icons.
      var iconClass = "wi-day-sunny";
      if ( currentWeather.icon == "clear-night" )
        iconClass = "wi-night-clear";
      if ( currentWeather.icon == "rain" )
        iconClass = "wi-rain";
      if ( currentWeather.icon == "snow" )
        iconClass = "wi-snow";
      if ( currentWeather.icon == "sleet" )
        iconClass = "wi-sleet";
      if ( currentWeather.icon == "wind" )
        iconClass = "wi-windy";
      if ( currentWeather.icon == "fog" )
        iconClass = "wi-day-fog";
      if ( currentWeather.icon == "cloudy" )
        iconClass = "wi-cloud";
      if ( currentWeather.icon == "partly-cloudy-day" )
        iconClass = "wi-day-cloudy";
      if ( currentWeather.icon == "partly-cloudy-night" )
        iconClass = "wi-night-cloudy";
      
      icon.innerHTML = "<i class=\"wi " + iconClass + "\"></i>";
      $( ele ).append ( icon );
      
      //- Add dew point
      var otherPoints = document.createElement ( "div" );
      otherPoints.setAttribute ( "class", "other-data" );
      
      var dewPoint = document.createElement ( "p" );
      dewPoint.setAttribute ( "class", "dew-point" );
      dewPoint.innerHTML = "Dew Point: " + currentWeather.dewPoint + "&#176; F";
      $( otherPoints ).append ( dewPoint );
      
      //- Add percent humidity
      var humidity = document.createElement ( "p" );
      humidity.setAttribute ( "class", "humidity" );
      humidity.innerHTML = "Humidity: " + ( currentWeather.humidity * 100 ) + "%";
      $( otherPoints ).append ( humidity );
      
      //- Add wind gust, speed, bearing
      var wind = document.createElement ( "p" );
      wind.setAttribute ( "class", "wind" );
      
      if ( currentWeather.windSpeed == 0 ) {
        //- If wind speed is zero, wind bearing is not definedwi
        wind.innerHTML = "Wind speed at " + currentWeather.windSpeed + " miles per hour";
      } else {
        //- In this case wind bearing is defined, so create the text from the degree returned from the API.
        var windDirection = "N";
        if ( currentWeather.windBearing > 22.5 || currentWeather.windBearing <= 67.5 )
          windDirection = "NE";
        if ( currentWeather.windBearing > 67.5 || currentWeather.windBearing <= 112.5 )
          windDirection = "E";
        if ( currentWeather.windBearing > 112.5 || currentWeather.windBearing <= 157.5 )
          windDirection = "SE";
        if ( currentWeather.windBearing > 157.5 || currentWeather.windBearing <= 202.5 )
          windDirection = "S";
        if ( currentWeather.windBearing > 202.5 || currentWeather.windBearing <= 247.5 )
          windDirection = "SW";
        if ( currentWeather.windBearing > 247.5 || currentWeather.windBearing <= 292.5 )
          windDirection = "W";
        if ( currentWeather.windBearing > 292.5 || currentWeather.windBearing <= 337.5 )
          windDirection = "NW";
        
        wind.innerHTML = "Wind speed at " + currentWeather.windSpeed + " miles per hour from " + windDirection;
      }
      
      $( otherPoints ).append ( wind );
      
      //- Add precipitation probability / intensity
      var precip = document.createElement ( "p" );
      precip.setAttribute ( "class", "precip" );
      
      if ( currentWeather.precipProbability == 0 ) {
        precip.innerHTML = "There is a " + ( currentWeather.precipProbability ) + "% chance of precipitation today";
      } else {
        precip.innerHTML = "There is a " + ( currentWeather.precipProbability ) + "% chance of " + currentWeather.precipIntencity + " inches of " + currentWeather.precipType + " today";
      }
      
      $( otherPoints ).append ( precip );
      $( ele ).append ( otherPoints );
      
      //- Add time (as of...)
      var time = document.createElement ( "p" );
      time.setAttribute ( "class", "time" );
      var timestamp = new Date ( currentWeather.time * 1000 );
      time.innerHTML = "Updated as of " + timestamp.getHours() + ":" + ( timestamp.getMinutes() < 10 ? "0" + timestamp.getMinutes() : timestamp.getMinutes() ) + " on " + ( timestamp.getMonth() + 1 ) + "/" + timestamp.getDate() + "/" + timestamp.getFullYear();
      $( ele ).append ( time );
      
      $( "#cards" ).append ( ele );
      
      //- Add minutely, hourly, and daily sections
      addMinutely ( darkSkyData.minutely );
      addHourly ( darkSkyData.hourly );
      addDaily ( darkSkyData.daily );
      
      console.log ( darkSkyData );
    } );
  } );
}

//- Creates the section for minutely weather data for the geolocation
function addMinutely ( minutelyData ) {
  //- Create a details section for the minute-by-minute data
  //- This will open and close automatically
  var minSection = document.createElement ( "details" );
  var summary = document.createElement ( "summary" );
  summary.innerHTML = "View forecast by minute for the next hour";
  $( minSection ).append ( summary );
  
  //- Create the table styled by Bootstrap
  var table = document.createElement ( "table" );
  table.setAttribute ( "class", "table" );
  
  //- Create the header row
  var header = document.createElement ( "thead" );
  var row = document.createElement ( "tr" );
  var col = document.createElement ( "th" );
  col.innerHTML = "Time";
  $( row ).append ( col );
  col = document.createElement ( "th" );
  col.innerHTML = "Precipitation";
  $( row ).append ( col );
  $( header ).append ( row );
  $( table ).append ( header );
  
  //- Create the body
  var body = document.createElement ( "tbody" );
  
  for (var i = 0; i < minutelyData.data.length; ++i) {
    var row = document.createElement ( "tr" );
    var date = new Date ( minutelyData.data[i].time * 1000 );
    col = document.createElement ( "td" );
    col.innerHTML = date.getHours() + ":" + ( date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes() );
    $( row ).append ( col );
    
    col = document.createElement ( "td" );
    if ( minutelyData.data[i].precipProbability == 0 )
      col.innerHTML = "There is a 0% chance of precipitation";
    else if ( minutelyData.data[i].precipIntensity == 0 )
      col.innerHTML = "There is a " + ( minutelyData.data[i].precipProbability * 100 ) + "% chance of precipitation";
    else
      col.innerHTML = "There is a " + ( minutelyData.data[i].precipProbability * 100 ) + "% chance of " + minutelyData.data[i].precipIntensity + " inches of " + minutelyData.data[i].precipType;
    $( row ).append ( col );
    $( body ).append ( row );
  }
  
  $( table ).append ( body );
  $( minSection ).append ( table );
  
  $( "#cards" ).append ( minSection );
}

//- Creates the section for hourly weather data for the geolocation
function addHourly ( hourlyData ) {
  //- Create a details section for the minute-by-minute data
  //- This will open and close automatically
  var hourSection = document.createElement ( "details" );
  var summary = document.createElement ( "summary" );
  summary.innerHTML = "View forecast by hour for the next 48 hours";
  $( hourSection ).append ( summary );
  
  //- Create the table styled by Bootstrap
  var table = document.createElement ( "table" );
  table.setAttribute ( "class", "table" );
  
  //- Create the header row
  var header = document.createElement ( "thead" );
  var row = document.createElement ( "tr" );
  var col = document.createElement ( "th" );
  col.innerHTML = "Time";
  $( row ).append ( col );
  col = document.createElement ( "th" );
  col.innerHTML = "Summary";
  $( row ).append ( col );
  col = document.createElement ( "th" );
  col.innerHTML = "Temperature";
  $( row ).append ( col );
  $( header ).append ( row );
  $( table ).append ( header );
  
  //- Create the body
  var body = document.createElement ( "tbody" );
  
  for (var i = 0; i < hourlyData.data.length; ++i) {
    var row = document.createElement ( "tr" );
    var date = new Date ( hourlyData.data[i].time * 1000 );
    col = document.createElement ( "td" );
    col.innerHTML = date.getHours() + ":" + ( date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes() );
    $( row ).append ( col );
    
    col = document.createElement ( "td" );
    col.innerHTML = hourlyData.data[i].summary;
    $( row ).append ( col );
    
    col = document.createElement ( "td" );
    col.innerHTML = hourlyData.data[i].temperature + "&#176; F";
    $( row ).append( col );
    
    $( body ).append ( row );
  }
  
  $( table ).append ( body );
  $( hourSection ).append ( table );
  
  $( "#cards" ).append ( hourSection );
}

//- Creates the section for daily weather data for the geolocation
function addDaily ( dailyData ) {
  //- Create a details section for the minute-by-minute data
  //- This will open and close automatically
  var dailySection = document.createElement ( "details" );
  var summary = document.createElement ( "summary" );
  summary.innerHTML = "View forecast by day for the next week";
  $( dailySection ).append ( summary );
  
  //- Create the table styled by Bootstrap
  var table = document.createElement ( "table" );
  table.setAttribute ( "class", "table" );
  
  //- Create the header row
  var header = document.createElement ( "thead" );
  var row = document.createElement ( "tr" );
  var col = document.createElement ( "th" );
  col.innerHTML = "Date";
  $( row ).append ( col );
  col = document.createElement ( "th" );
  col.innerHTML = "Summary";
  $( row ).append ( col );
  col = document.createElement ( "th" );
  col.innerHTML = "Temperature";
  $( row ).append ( col );
  $( header ).append ( row );
  $( table ).append ( header );
  
  //- Create the body
  var body = document.createElement ( "tbody" );
  
  for (var i = 0; i < dailyData.data.length; ++i) {
    var row = document.createElement ( "tr" );
    var date = new Date ( dailyData.data[i].time * 1000 );
    col = document.createElement ( "td" );
    col.innerHTML = ( date.getMonth() + 1 ) + "/" + date.getDate() + "/" + date.getFullYear();
    $( row ).append ( col );
    
    col = document.createElement ( "td" );
    col.innerHTML = dailyData.data[i].summary;
    $( row ).append ( col );
    
    col = document.createElement ( "td" );
    col.innerHTML = dailyData.data[i].temperatureHigh + "&#176; F / " + dailyData.data[i].temperatureLow + "&#176; F";
    $( row ).append( col );
    
    $( body ).append ( row );
  }
  
  $( table ).append ( body );
  $( dailySection ).append ( table );
  
  $( "#cards" ).append ( dailySection );
}

//- Creates and appends an error card with the given error message in it.
function createError ( errorMessage ) {
  //- Create the card and add the error and error class to it.
  $( "#cards" ).html ( "" );
  
  var card = document.createElement ( "div" );
  card.setAttribute ( "class", "weather-card" );
  
  var txt = document.createElement ( "p" );
  txt.setAttribute ( "class", "error" );
  txt.innerHTML = errorMessage;
  
  $( card ).append ( txt );
  $( "#cards" ).append ( card );
}