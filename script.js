const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const errorMsg = document.getElementById('errorMsg');
const currentWeather = document.getElementById('currentWeather');
const forecastContainer = document.getElementById('forecastContainer');
const forecastGrid = document.getElementById('forecastGrid');

const API_BASE_URL = 'https://localhost:7277/api/weather';

const weatherIcons = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Smoke': '🌫️',
    'Haze': '🌫️',
    'Dust': '🌫️',
    'Fog': '🌫️',
    'Sand': '🌫️',
    'Ash': '🌫️',
    'Squall': '💨',
    'Tornado': '🌪️'
};

searchBtn.addEventListener('click', searchWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchWeather();
    }
});

async function searchWeather() 
{
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    hideError();
    currentWeather.style.display = 'none';
    forecastContainer.style.display = 'none';
    loading.style.display = 'block';

    try {
        const currentResponse = await fetchCurrentWeather(city);
        const forecastResponse = await fetchForecast(city);
        
        displayCurrentWeather(currentResponse);
        displayForecast(forecastResponse);
        
    } catch (error) {
        showError(error.message);
    } finally {
        loading.style.display = 'none';
    }
}

async function fetchCurrentWeather(city) {
    const response = await fetch(`${API_BASE_URL}/current?city=${city}`);
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('City not found');
        }
        throw new Error('Failed to fetch weather data');
    }
    return await response.json();
}

async function fetchForecast(city) {
    const response = await fetch(`${API_BASE_URL}/forecast?city=${city}`);
    if (!response.ok) {
        throw new Error('Failed to fetch forecast data');
    }
    return await response.json();
}

function displayCurrentWeather(data) {
    document.getElementById('cityName').textContent = data.name;
    document.getElementById('weatherIcon').textContent = weatherIcons[data.weather[0].main] || '🌡️';
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('weatherDesc').textContent = data.weather[0].description;
    document.getElementById('feelsLike').textContent = `${Math.round(data.main.feels_like)}°C`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${data.wind.speed} m/s`;
    
    currentWeather.style.display = 'block';
}

function displayForecast(data) 
{
    forecastGrid.innerHTML = '';
    
    const dailyForecasts = [];
    for (let i = 0; i < Math.min(data.list.length, 24); i += 8) {
        dailyForecasts.push(data.list[i]);
    }
    
    dailyForecasts.forEach((day, index) => {
        const date = new Date(day.dt * 1000);
        const dayName = index === 0 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'long' });
        
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="forecast-date">${dayName}</div>
            <div class="weather-icon">${weatherIcons[day.weather[0].main] || '🌡️'}</div>
            <div class="forecast-temp">${Math.round(day.main.temp)}°C</div>
            <div class="forecast-desc">${day.weather[0].description}</div>
            <div class="forecast-minmax">
                Min: ${Math.round(day.main.temp_min)}°C | Max: ${Math.round(day.main.temp_max)}°C
            </div>
        `;
        
        forecastGrid.appendChild(card);
    });
    
    forecastContainer.style.display = 'block';
}

function showError(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
}

function hideError() {
    errorMsg.style.display = 'none';
}