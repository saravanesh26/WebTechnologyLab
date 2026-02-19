const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const weatherInfo = document.getElementById('weatherInfo');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('errorMessage');

// DOM Elements for data
const cityNameDisplay = document.getElementById('cityName');
const tempDisplay = document.getElementById('temperature');
const conditionDisplay = document.getElementById('condition');
const humidityDisplay = document.getElementById('humidity');
const weatherCodeDisplay = document.getElementById('weatherCode');
const weatherAppContainer = document.querySelector('.container');

// Cache variable to store last result
let lastSearchCache = {
    city: "",
    data: null
};

// Weather Code Mapping (WMO Code)
const weatherCodes = {
    0: "Clear sky",
    1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Depositing rime fog",
    51: "Drizzle: Light", 53: "Drizzle: Moderate", 55: "Drizzle: Dense",
    56: "Freezing Drizzle: Light", 57: "Freezing Drizzle: Dense",
    61: "Rain: Slight", 63: "Rain: Moderate", 65: "Rain: Heavy",
    66: "Freezing Rain: Light", 67: "Freezing Rain: Heavy",
    71: "Snow fall: Slight", 73: "Snow fall: Moderate", 75: "Snow fall: Heavy",
    77: "Snow grains",
    80: "Rain showers: Slight", 81: "Rain showers: Moderate", 82: "Rain showers: Violent",
    85: "Snow showers: Slight", 86: "Snow showers: Heavy",
    95: "Thunderstorm: Slight or moderate",
    96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail"
};

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
    } else {
        showError("Please enter a city name.");
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeather(city);
        } else {
            showError("Please enter a city name.");
        }
    }
});

async function fetchWeather(city) {
    // Check cache first
    if (lastSearchCache.city.toLowerCase() === city.toLowerCase() && lastSearchCache.data) {
        console.log("Serving from cache");
        updateUI(lastSearchCache.data, lastSearchCache.city);
        return;
    }

    showLoader();
    errorMessage.style.display = 'none';
    weatherInfo.classList.add('hidden');
    weatherAppContainer.style.height = 'auto';

    try {
        // Step 1: Geocoding to get Lat/Lon
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoUrl);
        if (!geoResponse.ok) throw new Error("Geocoding service unavailable");

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Please try again.");
        }

        const { latitude, longitude, name, country } = geoData.results[0];

        // Step 2: Fetch Weather Data
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code`;

        const weatherResponse = await fetch(weatherUrl);
        if (!weatherResponse.ok) throw new Error("Weather service unavailable");

        const weatherData = await weatherResponse.json();

        const result = {
            name: `${name}, ${country}`,
            temp: weatherData.current.temperature_2m,
            humidity: weatherData.current.relative_humidity_2m,
            code: weatherData.current.weather_code,
            unit: weatherData.current_units.temperature_2m // Usually °C
        };

        // Update Cache
        lastSearchCache = {
            city: city,
            data: result
        };

        updateUI(result, city);

    } catch (error) {
        showError(error.message);
    } finally {
        hideLoader();
    }
}

function updateUI(data, cityQuery) {
    cityNameDisplay.textContent = data.name;
    tempDisplay.textContent = `${data.temp}${data.unit}`;
    humidityDisplay.textContent = `${data.humidity}%`;

    // Convert WMO code to text
    const conditionText = weatherCodes[data.code] || "Unknown";
    conditionDisplay.textContent = conditionText;
    weatherCodeDisplay.textContent = conditionText; // Reuse text for detail view

    weatherInfo.classList.remove('hidden');
    // Trigger reflow for animation
    void weatherInfo.offsetWidth;
    weatherInfo.classList.add('active');
}

function showLoader() {
    loader.style.display = 'block';
}

function hideLoader() {
    loader.style.display = 'none';
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    hideLoader();
}
