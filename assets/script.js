let favoriteEvents = {};
let favoriteAttractions = {};
var today = moment().format("YYYY-MM-DD");
var tomorrow = moment().add(7,'days').format("YYYY-MM-DD");
var city = "";
var maxDay = moment().add(6, 'd').format("YYYY-MM-DD")
var outdoorActivities = ["Ride a bike", "Play hopscotch", "Climb a tree", "Have a picnic", "Fly a kite", "Go on a hike", "Draw with chalk", "Do tie-dye", "Play Frisbee", "Rollerskate"]
var indoorActivities = ["Bake a cake", "Play rock paper scissors", "Build a fort", "Do a puzzle", "Read a book", "Set up a scavenger hunt", "Draw", "Do Yoga", "Watch a movie", "Play hide and seek"]

function limitCalendar(){
  $("#date").attr("max", maxDay)
  $("#date").attr("min", today) 
}

function initialize() {
  limitCalendar();
  if (localStorage.getItem("!Bored-Events") !== "undefined") {
    favoriteEvents = {...JSON.parse(localStorage.getItem("!Bored-Events"))};
    updateFavoriteEventsUI();
  };
  if (localStorage.getItem("!Bored-Attractions") !== "undefined") {
    favoriteAttractions = {...JSON.parse(localStorage.getItem("!Bored-Attractions"))};
    updateFavoriteAttractionsUI();
  }
}

function getLocation() {
  // Make sure browser supports this feature
  if (navigator.geolocation) {
    // Provide our showPosition() function to getCurrentPosition
    navigator.geolocation.getCurrentPosition(showPosition);
  } 
  else {
    $("#alertHeader").text("Geolocation is not supported by this browser.")
    $("#alertBody").text("Please search for your location using the provided form.")
    $("#alertModal").addClass("active")
    $("#closeAlert").on("click", function(event){
      event.preventDefault()
      $("#alertModal").removeClass("active")
    })
  }
}

function showPosition(position) {
  // Grab coordinates from the given object
  var lat = position.coords.latitude;
  var lon = position.coords.longitude;
  getEvents(getGeoHash(lat, lon));
  displayCityName(lat,lon);
  displayAttractions(getGeoHash(lat, lon))

}

function getGeoHash(lat, lon) {
  return Geohash.encode(lat, lon, 6)
}

function getEvents(geoHash) {
  $.ajax({
    type:"GET",
    url:`https://app.ticketmaster.com/discovery/v2/events.json?startDateTime=${today}T00:00:00Z&endDateTime=${tomorrow}T00:00:00Z&geoPoint=${geoHash}&apikey=Br1l7WKm6rF3XAHs0vPmEIZoapMi7p8A`,
    async:true,
    dataType: "json",
    success: function(json){
      updateEventsUI([...json._embedded.events])
    },
    error: function(xhr, status, err) {
          console.log(err);
         }
    });
  }

  function getEventsCityDate(city) {
    $.ajax({
      type:"GET",
      url:`https://app.ticketmaster.com/discovery/v2/events.json?startDateTime=${today}T00:00:00Z&endDateTime=${tomorrow}T00:00:00Z&city=[${city}]&apikey=Br1l7WKm6rF3XAHs0vPmEIZoapMi7p8A`,
      async:true,
      dataType: "json",
      success: function(json){
        updateEventsUI([...json._embedded.events])
      },
      error: function(xhr, status, err) {
            console.log(err);
           }
      });
    }

  function updateAttractionsUI(data_arr){
    data_arr.forEach(element => {
      let newAttraction = $("<li>");
      newAttraction.text(element.name)
      let newAttractionBtn = $("<button>")
        .attr({
          "type": "button",
          "class": "btn btn-info btn-sm attractionChoices",
          "data-container": "body",
          "data-toggle": "modal",
          "data-target": "#exampleModal",
          "data-list": `attractions`,
          "data-title": `${element}`,
          "data-url": ""
        })
        .html(`${element}`);
      newAttraction
      .append(newAttractionBtn);
      $("#attractions").append(newAttraction);
    })
  } 

  function updateEventsUI(data_arr){
    $("#events").empty();
    data_arr = [...data_arr.slice(0,10)];
    data_arr.forEach((element, index) => {
      let newEvent = $("<li>")
        .attr("data", `${index}`)
      let newEventBtn = $("<button>")
        .attr({
          "type": "button",
          "class": "btn btn-info btn-sm eventChoices",
          "data-container": "body",
          "data-toggle": "modal",
          "data-target": "#exampleModal",
          "data-list": `events`,
          "data-date": `${element.dates.start.localDate}`,
          "data-url": `${element.url}`,
          "data-title": `${element.name}`
        })
        .html(`${element.name}`);
      newEvent
        .append(newEventBtn)
      $("#events")
      .append(newEvent)
    })
} 

//When current location is enabled on the browser

function displayCityName(lat,lon) {
  let queryURL = "https://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+lon+"&appid=fd8e3b4dd5f260d4ef1f4327d6e0279a";
  $.ajax({
      url: queryURL,
      method:"GET"
  }).then(function(response){   
    $("#location-and-date").html(response.name +"("+ convertUnixtoDate(response.dt)+")");
    WeatherInfo(response);
  })
}

//Temparature conversion function

function convertKtoF(tempInKelvin) {
  return ((tempInKelvin - 273.15) * 9) / 5 + 32;
}

//Updates 
function updateWeek(date) {
  this.today = date;
  this.tomorrow = moment(date).add(7,'days').format("YYYY-MM-DD");
}

//Convert Unix format to Standard Date

function convertUnixtoDate(unixformat) {
  var unixTimeStamp = unixformat;
  var timestampInMilliSeconds = unixTimeStamp*1000;
  var date = new Date(timestampInMilliSeconds);
  var day = (date.getDate() < 10 ? '0' : '') + date.getDate();
  var month = (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1);
  var year = date.getFullYear();
  var formattedDate = year + '-' + month + '-' + day;
  return (formattedDate);
}

//When the current location is blocked on the browser, User Input is gathered from Text Box value

function getTempData(cityInput,dateInput){
  let TempapiURL = "https://api.openweathermap.org/data/2.5/weather?q="+cityInput+"&appid=fd8e3b4dd5f260d4ef1f4327d6e0279a";
  $("#location-and-date").html(cityInput + "("+dateInput+")");
  $.ajax({
    method:"GET",
    url: TempapiURL
  }).then(function(response){
    var currDate = moment().format("YYYY-MM-DD");
    var dateDiff = (Date.parse(dateInput) - Date.parse(currDate))/86400000;
   var cityLat = response.coord.lat;
   var cityLon = response.coord.lon;
   dayForecast(cityLat,cityLon,dateDiff);
  })
}

//Weather info based on date selected

function dayForecast(cityLat,cityLon,dateDiff){
let forecastQueryURL = "https://api.openweathermap.org/data/2.5/onecall?lat="+cityLat+"&lon="+cityLon+"&appid=fd8e3b4dd5f260d4ef1f4327d6e0279a";
$.ajax({
  method:"GET",
  url:forecastQueryURL
}).then(function(response){
  var imageSrc = " https://openweathermap.org/img/wn/"+response.daily[dateDiff].weather[0].icon+".png";
  $("#weather-icon").attr("src",imageSrc);
  $("#weather").html("Weather Conditions: "+ response.daily[dateDiff].weather[0].main);
  $("#temp").html("Temparature: "+ (convertKtoF(response.daily[dateDiff].temp.day)).toFixed(2) + "&deg;F");
  $("#wind").html("Wind Speed: "+response.daily[dateDiff].wind_speed+"MPH");
  if(response.daily[dateDiff].weather[0].main === "Clear" || response.daily[dateDiff].weather[0].main === "Clouds"){
    $("#recommendation").text("outdoor")
  } else {
    $("#recommendation").text("indoor")
  }
})
}



//Weather Info

function WeatherInfo(response)
{
  var imageSrc = " https://openweathermap.org/img/wn/"+response.weather[0].icon+".png";
  $("#weather-icon").attr("src",imageSrc);
  $("#weather").html("Weather Conditions: "+ response.weather[0].main);
  $("#temp").html("Temparature: "+ (convertKtoF(response.main.temp)).toFixed(2) + "&deg;F");
  $("#wind").html("Wind Speed: "+response.wind.speed+"MPH");
  if(response.weather[0].main === "Clear" || response.weather[0].main === "Clouds"){
    $("#recommendation").text("outdoor")
  } else {
    $("#recommendation").text("indoor")
  }
}

function displayAttractions(city){
  let attractionsQueryURL = "https://www.triposo.com/api/20200803/poi.json?tag_labels=sightseeing|tous|nightlife|cuisine|do&location_id="+city+"&count=15&order_by=-score&fields=name,best_for,coordinates,score,id&account=BMUC2RQB&token=0moqmf7h8qna8hw3ijun6r9sdb8eqqow"
  $.ajax({
      url: attractionsQueryURL,
      method:"GET"
  }).then(function(response){
    $("#attractions").empty();
    let attractions = response.results
    if (attractions.length === 0){
      //TODO is the weather known here yet? I donno -Dan
      let noAttraction = $("<li>").text("No city attractions found at your location. Try one of these:")
      $("#attractions").append(noAttraction)
      if ($("#recommendation").text()==="outdoor"){
        updateAttractionsUI(outdoorActivities);
      } else if ($("#recommendation").text()==="indoor"){
        updateAttractionsUI(indoorActivities);
      }  
    } else {
      attractionList = [];
      attractions.forEach(element => {
        attractionList.push(element.name);
      });
      updateAttractionsUI(attractionList);
    }
  })
}

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

function updateFavoriteEventsUI() {
    $("#fav-events").empty();
    let keys = Object.keys(favoriteEvents);
    if (keys) {
      keys.forEach(element => {
        let newFav = $("<li>")
          .html('<span>'+element+'</span>' + '<button class="delete-button"><i class="trash alternate icon"></i></button>')
          .attr({
            "id": `${favoriteEvents[`${element}`].date}|${favoriteEvents[`${element}`].name}`,
            "list": "events"
          })
        $("#fav-events").append(newFav);
      })
    }
}

function updateFavoriteAttractionsUI() {
  $("#fav-attractions").empty();
  let keys = Object.keys(favoriteAttractions);
  if (keys) {
    keys.forEach(element => {
      let newFav = $("<li>")
        .html(`<span>${element}</span><button class="delete-button"><i class="trash alternate icon"></i></button>`)
        .attr({
          "id": `${favoriteAttractions[`${element}`].name}`,
          "list": "attractions"
        })
        $("#fav-attractions").append(newFav);
    })
  }
}

//Click Event Handler while searching for a specific location

$("#submit").on("click",function(event){
  event.preventDefault();
  let cityInput = $("#location").val().toLowerCase().trim();
  let dateInput = $("#date").val();
  event.preventDefault();
  if(cityInput === "" || dateInput === "")
  {
    $("#alertHeader").text("You are missing a field.")
    $("#alertBody").text("Please enter both a location and date.")
    $("#alertModal").addClass("active")
    $("#closeAlert").on("click", function(event){
      event.preventDefault()
      $("#alertModal").removeClass("active")
    })
  }
  else
  {
  getTempData(cityInput,dateInput);
  updateWeek($("#date").val());
  displayAttractions(toTitleCase(cityInput));
  getEventsCityDate(cityInput);
  
  }
})

//Click Event Handler on events
$("#attractions").on("click",function(event){
  event.preventDefault();
  if ($(event.target).parent().parent()[0].attributes[0].value !== undefined) {
    $(event.target).parent().attr("class", "btn btn-primary btn-sm");
    let eventData = $(event.target).parent()[0].childNodes[0].dataset;
    $("#modalLabel").html(eventData.title);
    $(".modal-body")
      .attr("class", "modal-body event")
      .html(`${eventData.title}`)
    $("#save")
      .attr({
        "title": eventData.title,
        "date": eventData.date,
        "url": eventData.url,
        "list": "attractions"

      })
    }
  })

//Click Event Handler on events
$("#events").on("click",function(event){
  event.preventDefault();
  if ($(event.target).parent().parent()[0].attributes[0].value !== undefined) {
    $(event.target).parent().attr("class", "btn btn-primary btn-sm");
    let eventData = $(event.target).parent()[0].childNodes[0].dataset;
    $("#modalLabel").html(eventData.title);
    $(".modal-body")
      .attr("class", "modal-body event")
      .html(`${eventData.title} on ${eventData.date} <a href=${eventData.url}> Event Link</a>`)
    $("#save")
      .attr({
        "title": eventData.title,
        "date": eventData.date,
        "url": eventData.url,
        "list": "events"

      })
    }
  })

$("#save").on("click",function(event){
  event.preventDefault();
  let data = event.target.attributes;
  if (data.list.value === "events") {
      favoriteEvents[`${data.date.value}|${data.title.value}`] = {
      name: `${data.title.value}`,
      date: `${data.date.value}`,
      url: `${data.url.value}`
    };
    localStorage.setItem("!Bored-Events", JSON.stringify(favoriteEvents));
    updateFavoriteEventsUI();
  } else {
    data = data.title.value;
    favoriteAttractions[`${data}`] = {
      name: `${data}`
    };
    localStorage.setItem("!Bored-Attractions", JSON.stringify(favoriteAttractions));
    updateFavoriteAttractionsUI();
  }
})

$("#fav-events").on("click", function(event){
  event.preventDefault();
  savedItem = $(event.target).parent().parent();
  delete favoriteEvents[`${savedItem[0].attributes.id.value}`]
  localStorage.setItem("!Bored-Events", JSON.stringify(favoriteEvents));
  updateFavoriteEventsUI();
})

$("#fav-attractions").on("click", function(event){
  event.preventDefault();
  savedItem = $(event.target).parent().parent();
  delete favoriteAttractions[`${savedItem[0].attributes.id.value}`]
  localStorage.setItem("!Bored-Attractions", JSON.stringify(favoriteAttractions));
  updateFavoriteAttractionsUI();
})

$('#myModal').on('shown.bs.modal', function () {
  $('#myInput').trigger('focus')
})


initialize();
getLocation();