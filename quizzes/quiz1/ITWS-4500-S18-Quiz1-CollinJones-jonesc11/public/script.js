$(document).ready (function () {
  $('input[name=run]').on('click', function () {
    var zipcodeInput = $('input[name=zipcode]').val();
    
    $.ajax({
	  type: 'POST',
	  data: JSON.stringify({zipcode: zipcodeInput}),
      contentType: 'application/json',
      url: 'http://localhost:3000/submit',						
      success: function(data) {
        var dataParsed = JSON.parse(data);
        var ele = document.createElement("P");
        var temp = dataParsed.temperature;
        
        var color = 'red';
        var s = 'hot';
        
        if (temp <= 0) {
          color = 'light blue';
          s = 'freezing';
        } else if (temp <= 10) {
          color = 'blue';
          s = 'cold';
        } else if (temp <= 25) {
          color = 'yellow';
          s = 'warm';
        }
        
        $(ele).attr("style", "color:" + color + ";");
        $(ele).html("In " + zipcodeInput + ", it is " + s);
        
        $("#results").append(ele);
      }
    });
  });
  
  $('input[name=refresh]').on('click', function () {
    $('#results').html("");
  });
});