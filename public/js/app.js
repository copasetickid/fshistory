$(document).ready(function(){

    var params = getQueryParams(window.location.href);
    var oauth_token = "&oauth_token=1GMB02TRGBW55GNQQEXWUBVDNQGGLYRL3E0WTHIK4V3BNTPT";
    var userLat, userLng, userPos;

    /* Foursquare API Functions*/
    function getQueryParams(qs) {
            qs = qs.split("+").join(" ");
            var params = {}, tokens,
                re = /[?&]?([^=]+)=([^&]*)/g;
            while (tokens = re.exec(qs)) {
                params["token"]
                    = decodeURIComponent(tokens[2]);
            }
            console.log(params);
            return params;
   }

  $("#sign-in").click(function(){

     window.location = "https://foursquare.com/oauth2/authenticate?client_id=I0SDVTAIVNFQWQP0ZQSZASAMPN00I5YQ23D2FNYZ12VR2FTW&response_type=token&redirect_uri=http://elizabethandclarke.com/testing/meetup.html"



      $.ajax({
        url: "https://api.foursquare.com/v2/users/self?oauth_token=" + params.token + "&v=20120420",
        crossDomain: true,
        dataType: "jsonp",
        type: "GET",
        success: function(data){
          console.log(data);
          var user = data.response.user.firstName + " " + data.response.user.lastName;
          $('div').html(user);
        },
        error: function(data){
          console.log(data);
          $('div').html("User not logged in");
        }
      })
  })

  /* Grab geolocation to use for searching nearby venues */
    if(navigator.geolocation){
       //$("#geoLoc").click(init_geolocation);
      init_geolocation();
      

      //navigator.geolocation.getCurrentPosition(init_geolocation);

    } else{
      $("#geoLoc").html("Your browser isn't supported");
    }
    


   function init_geolocation(){

     navigator.geolocation.getCurrentPosition(query_location);
   }

   function query_location(position){

     userLat = position.coords.latitude;
     userLng = position.coords.longitude;
  
    console.log(userLat + "," + userLng);
    initMap(userLat,userLng);

   
    


     $("#searchFSVenue").click(function(){
        var value = $("input").val();
         $("#venues").html( " ");


        $.ajax({
          url: "https://api.foursquare.com/v2/venues/search?ll="+userLat+","+userLng+ "&query="+ value + oauth_token + "&v=20120426",
          crossDomain: true,
          dataType: "jsonp",
          type: "GET",
          success: function(data){
                   console.log(data);
                   var list = $('<ul></ul>');


                  var latPos = [];
                  var lngPos = [];
                  var locDetails = [];


                  for(i=0;i<data.response.venues.length;i++)
                  {
                    console.log(data.response.venues[i].name);

                    var item = data.response.venues[i].name + " " +
                               data.response.venues[i].location.address + "  " + 
                               "Here Now:   " +
                               data.response.venues[i].hereNow.count + 
                               "    Checkin History: " +
                               data.response.venues[i].stats.checkinsCount + 
                               "    Users Who've Been Here " + 
                               data.response.venues[i].stats.usersCount ;
                    var listItem = $('<li></li>');
                    listItem.html(item);
                    list.append(listItem);
                  }
                  //$("#venues").append(list);

                  for(i=0; i< data.response.venues.length;i++)
                  {

                    var lat = data.response.venues[i].location.lat;
                    var lng = data.response.venues[i].location.lng;
                    var details = data.response.venues[i].name + " " +
                                  data.response.venues[i].location.address + " " +
                                  data.response.venues[i].location.city + " " +
                                  data.response.venues[i].location.state + " " + 
                                  "Here Now:   " +
                                   data.response.venues[i].hereNow.count + 
                                   "    Checkin History: " +
                                   data.response.venues[i].stats.checkinsCount + 
                                   "    Users Who've Been Here " + 
                                   data.response.venues[i].stats.usersCount;

                    latPos[i] = lat;
                    lngPos[i] = lng;
                    locDetails[i] = details;
                    
                  }

                  populate(userLat, userLng, latPos, lngPos, locDetails);


          },
          error: function(data){
                console.log(data);
          }
      })
    }) //End of #search click
  }

$("#venues").on("click", "li", function(e) {
  //console.log("hi");
});




function initMap(userLat, userLng){

  var coords = new google.maps.LatLng(userLat, userLng);
    var mapOptions ={
      zoom: 12,
      center: coords,
      mapTypeControl: true,
      navigationControlOptions: {
        style: google.maps.NavigationControlStyle.SMALL
      },
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }; //end of mapOptions
    map = new google.maps.Map(document.getElementById("mapCanvas"), mapOptions);

    google.maps.event.trigger(map, "resize");

}





  function populate(userLat, userLng, latPos, lngPos, locDetails){
    var marker, i;
    var infowindow = new google.maps.InfoWindow();

    var coords = new google.maps.LatLng(userLat, userLng);
    var mapOptions ={
      zoom: 12,
      center: coords,
      mapTypeControl: true,
      navigationControlOptions: {
        style: google.maps.NavigationControlStyle.SMALL
      },
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }; //end of mapOptions
    venueMap = new google.maps.Map(document.getElementById("mapCanvas"), mapOptions);
    

    for(i=0; i < latPos.length; i++)
    {
      marker = new google.maps.Marker({
              position: new google.maps.LatLng(latPos[i], lngPos[i]),
              map: venueMap
      });

      google.maps.event.addListener(marker, 'click', (function(marker,i){
        return function(){
          infowindow.setContent(locDetails[i]);
          infowindow.open(venueMap, marker);
        }
      })(marker,i));
    }//end of for loop
  }

  function detectBrowser() {
  var useragent = navigator.userAgent;
  var mapdiv = document.getElementById("mapCanvas");

  if (useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1 ) {
    mapdiv.style.width = '100%';
    mapdiv.style.height = '100%';
  } else {
    mapdiv.style.width = '600px';
    mapdiv.style.height = '800px';
  }
}
}) //End of .ready() function