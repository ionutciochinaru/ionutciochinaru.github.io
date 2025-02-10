const { ref, onMounted } = Vue
import { WEATHER_CONDITIONS } from '../constants/weather.js'

export function useWeather() {
    const weather = ref({
        current: {
            temperature: 0,
            windSpeed: 0,
            humidity: 0,
            condition: 'Clear'
        },
        forecast: []
    })

    const getWeatherIcon = (condition) => {
        const icons = {
            'Clear': '☀️',
            'Partly cloudy': '⛅',
            'Cloudy': '☁️',
            'Rain': '🌧️',
            'Snow': '❄️',
            'Thunderstorm': '⛈️',
            'Mist': '🌫️'
        }
        return icons[condition] || '☀️'
    }

    const getWeatherCondition = (code) => {
        return WEATHER_CONDITIONS[code] || 'Clear'
    }

    const fetchWeather = async () => {
        try {
            const response = await fetch(
                "https://api.open-meteo.com/v1/forecast?" +
                "latitude=52.52&longitude=13.41" +
                "&current=temperature_2m,relative_humidity_2m,wind_speed_10m" +
                "&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code" +
                "&timezone=auto" +
                "&forecast_days=10"
            )
            const data = await response.json()

            // Process current weather
            weather.value.current = {
                temperature: Math.round(data.current.temperature_2m),
                windSpeed: Math.round(data.current.wind_speed_10m),
                humidity: Math.round(data.current.relative_humidity_2m),
                condition: getWeatherCondition(data.daily.weather_code[0])
            }

            // Process forecast
            weather.value.forecast = data.daily.time.map((date, index) => ({
                date,
                maxTemp: Math.round(data.daily.temperature_2m_max[index]),
                minTemp: Math.round(data.daily.temperature_2m_min[index]),
                precipitation: data.daily.precipitation_probability_max[index],
                condition: getWeatherCondition(data.daily.weather_code[index])
            }))
        } catch (error) {
            console.error('Error fetching weather:', error)
        }
    }

    onMounted(() => {
        fetchWeather()
        setInterval(fetchWeather, 30 * 60 * 1000) // Update every 30 minutes
    })

    return {
        weather,
        getWeatherIcon
    }
}