// Import dependencies
require("dotenv").config(); // For loading .env variables
const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;

// Set EJS as the view engine
app.set("view engine", "ejs");

// Serve static files from 'public' folder (e.g., CSS)
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//variables for API
let currentCity = "";
let currentDay = "";
let currentTemp = "";
let currentDescription = "";
let currentIcon = "";

let currentTempMin = "";
let currentTempMax = "";
let currentSunrise = "";
let currentSunset = "";
let currentWind = "";
let currentUVI = "";

let hourlyData = "";
let hourlyForecast = "";
let weeklyForecast = "";

//initial route get request
app.get("/", (req, res) => {
  res.render("index", {
    cityName: null,
    currentDay: null,
    currentTemp: null,
    currentIcon: null,
    currentDescription: null,
    currentTempMin: null,
    currentTempMax: null,
    currentSunrise: null,
    currentSunset: null,
    currentWind: null,
    currentUVI: null,
    hourlyForecast: null,
    weeklyForecast: null
  });
});


//Route to post weather forecast after user enters city name
app.post("/weatherData", async (req, res) => {

  const city = req.body.cityInput; //takes city name from input posted
  console.log(city); //check city input on console
  const apiKey = "45dc06b81aca5bac767490cf4ed526ad";

  try {
          // Step 1: Get logitude and latitude and city name + country
          const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
          const { lat, lon } = weatherResponse.data.coord;

          currentCity = weatherResponse.data.name + ", " + weatherResponse.data.sys.country;
          currentDay = new Date((weatherResponse.data.dt) * 1000).toLocaleDateString('en-US', {weekday: 'long', day: 'numeric', month: 'long'});


          // Step 2: Get the rest of data using acquired lon and lat
          const forecastResponse = await axios.get(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude={part}&appid=${apiKey}&units=metric`);
          
          currentTemp = Math.round(weatherResponse.data.main.temp);
          currentTempMin = Math.round(weatherResponse.data.main.temp_min);
          currentTempMax = Math.round(weatherResponse.data.main.temp_max);
          currentDescription = weatherResponse.data.weather[0].description;
          currentIcon = weatherResponse.data.weather[0].icon;


          //add
          currentSunrise = new Date((forecastResponse.data.current.sunrise) * 1000).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
          currentSunset = new Date((forecastResponse.data.current.sunset) * 1000).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
          currentWind = forecastResponse.data.current.wind_speed;
          currentUVI = Math.round(forecastResponse.data.current.uvi);

          hourlyData = forecastResponse.data.hourly;
  
          //maps data for hourly forecast
          hourlyForecast = hourlyData.slice(0,24).map((hour) => ({
              //converts to hour and removes spaces between
              time: new Date(hour.dt * 1000).toLocaleTimeString([], {hour: "2-digit"}).replace(/\s/g, ''),
              temperature: Math.round(hour.temp), //round off temperature
              icon: `https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`
          }));

          //maps data for weekly forecast
          weeklyForecast = forecastResponse.data.daily.map((day) => ({
            weekday: new Date(day.dt * 1000).toLocaleDateString('en-US', {weekday: 'long'}).slice(0,3),
            icon: `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`,
            low: Math.round(day.temp.min),
            high: Math.round(day.temp.max)
    
        }));

          

        //====================for testing in console==============================//

        const stringifyCurrent = JSON.stringify(forecastResponse.data.current, null, 2);
        console.log("this is the current forecast \n" + stringifyCurrent);

        const stringifyDaily = JSON.stringify(forecastResponse.data.daily[0], null, 2);
        // const stringify2 = JSON.stringify(forecastResponse.data.hourly, null, 2);
        console.log("this is the 7-day forecast \n" + stringifyDaily);
  
          console.log(weatherResponse.data);
          console.log(weeklyForecast);
     
  
  
  
          // weeklyForecast.forEach((day) => {
          //     day.weekday;
          //     day.icon;
          //     day.low;
          //     day.high;
          // })
  
  
          //for EJS
          // hourlyForecast.forEach((hour) => {
          //     hour.time
          //     hour.temperature
          //     hour.icon
          // })
          
          // console.log(hourlyForecast);

  
          res.render("weatherData", {

            cityName: currentCity,
            currentDay: currentDay,
            currentTemp: currentTemp,
            currentIcon: currentIcon,
            currentDescription: currentDescription,
            currentTempMin: currentTempMin,
            currentTempMax: currentTempMax,
            currentSunrise: currentSunrise,
            currentSunset: currentSunset,
            currentWind: currentWind,
            currentUVI: currentUVI,
            hourlyForecast: hourlyForecast,
            weeklyForecast: weeklyForecast
    });


  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
