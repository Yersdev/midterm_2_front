document.addEventListener("DOMContentLoaded", () => {
    const cityInput = document.querySelector(".app__search");
    const searchButton = document.querySelector(".app_location");
    const weatherIcon = document.getElementById("main-info__data-mid__wheather");

    if (!cityInput || !searchButton) {
        console.error("Required elements not found in the DOM.");
        return;
    }

    const API_KEY = "YOUR API";

    const clearWeatherData = () => {
        const elements = [
            ".main-info__temp",
            ".felling-temp",
            ".humidity-info",
            ".wind-info",
            ".pressure-info",
            ".main-info__data-mid__wheather-info",
            ".main-info__time h2",
            ".main-info__time__date",
            ".main-info__time__clock",
            ".uv-index"
        ];

        elements.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) element.textContent = "";
        });
    };

//try to convert the time
    const formatTimeInTimezone = (timezoneOffset) => {
        const dateElement = document.getElementById("mian-info__time__date");
        const clockElement = document.getElementById("main-info__time__clock");
    
        if (!dateElement || !clockElement) {
            console.warn("Date or Clock element not found. Retrying...");
            return;
        }
    
        const utcTime = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
        const localTime = new Date(utcTime + timezoneOffset * 1000);
    
        dateElement.textContent = localTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        clockElement.textContent = localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };
    
    const startUpdatingTime = (timezoneOffset) => {
        formatTimeInTimezone(timezoneOffset);
        setInterval(() => formatTimeInTimezone(timezoneOffset), 1000); 
    };
    
//receive detail info to use it
    const getWeatherDetails = async (lat, lon, cityName) => {
        const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    
        try {
            const res = await fetch(WEATHER_API_URL);
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            
            const data = await res.json();
            updateWeatherData(data, cityName);
            startUpdatingTime(data.timezone);

            get5DayForecast(lat, lon);
        } catch (error) {
            console.error("Error fetching weather details:", error);
            alert("Error fetching weather data!");
        }
    };

    //updating the weather data by getting info about city
  const updateWeatherData = (data, cityName) => {
    document.querySelector(".main-info__temp").textContent = `${data.main.temp}°C`;
    document.querySelector(".felling-temp").textContent = `${data.main.feels_like}°C`;
    document.querySelector(".humidity-info").textContent = `${data.main.humidity}%`;
    document.querySelector(".wind-info").textContent = `${data.wind.speed} km/h`;
    document.querySelector(".main-info__data-mid__wheather-info").textContent = data.weather[0].description;
    document.querySelector(".main-info__time h2").textContent = cityName;

    document.querySelector("#main-info__sun-rise-time").textContent = `${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}`;
    document.querySelector("#main-info__sun-set-time").textContent = `${new Date(data.sys.sunset * 1000).toLocaleTimeString()}`;

    
    const weatherIcon = document.querySelector("#main-info__data-mid__wheather");
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
};

//try to receive informationi about 5 days of the current city
    const get5DayForecast = async (lat, lon) => {
        const FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    
        try {
            const res = await fetch(FORECAST_API_URL);
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    
            const data = await res.json();
            updateForecastData(data);
        } catch (error) {
            console.error("Error fetching 5-day forecast:", error);
            alert("Error fetching 5-day forecast data.");
        }
    };
    const getCityName = async (lat, lon) => {
        const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
        try {
            const res = await fetch(GEOCODING_API_URL);
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            const data = await res.json();
            return data[0].name;
        } catch (error) {
            console.error("Error fetching city name:", error);
            return "Your Location";
        }
    };
  
    
    const getWeatherForCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const cityName = await getCityName(latitude, longitude);
                    getWeatherDetails(latitude, longitude, `Your Location - ${cityName}`);
                },
                (error) => {
                    console.error("Error fetching location:", error);
                    alert("Unable to retrieve your location.");
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };
    
    document.querySelector(".app_location").addEventListener("click", getWeatherForCurrentLocation);
    

    const updateForecastData = (forecastData) => {
        const dailyForecast = forecastData.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 5);
    
        dailyForecast.forEach((forecast, index) => {
            document.querySelector(`.main-info__forecast-temp-${index + 1}`).textContent = `${Math.round(forecast.main.temp)}°C`;
            document.querySelector(`.forecast-wheather-${index + 1}-img img`).src = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;
            document.querySelector(`.main-info__forecast-day${index + 1}-text`).textContent = new Date(forecast.dt * 1000).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric'
            });
        });
    };

    //to get info by coordinates, using in current location
    const getCityCoordinates = async (cityName) => {
        const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${API_KEY}`;
        
        try {
            const res = await fetch(GEOCODING_API_URL);
            const data = await res.json();
            if (data.length === 0) {
                alert("City not found!");
                return;
            }

            const { lat, lon, name } = data[0];
            clearWeatherData();
            getWeatherDetails(lat, lon, name);
        } catch (error) {
            console.error("Error fetching coordinates:", error);
            alert("Error fetching city coordinates.");
        }
    };
//enter to start searching
    cityInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            const cityName = cityInput.value.trim();
            if (cityName) getCityCoordinates(cityName);
        }
    });

    searchButton.addEventListener("click", () => {
        const cityName = cityInput.value.trim();
        if (cityName) getCityCoordinates(cityName);
    });
});
