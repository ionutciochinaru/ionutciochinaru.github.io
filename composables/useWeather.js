const { ref, onMounted } = Vue

export function useWeather() {
    const weather = ref({
        current: {
            temperature: 0,
            windSpeed: 0,
            humidity: 0,
            condition: 'Clear',
            feelsLike: 0,
            uv: 0
        },
        forecast: [],
        lastUpdated: null
    })

    const CACHE_KEY = 'weather_data'
    const CACHE_DURATION = 2 * 60 * 60 * 1000 // 2 hours in milliseconds
    const POLL_INTERVAL = 60 * 60 * 1000 // 1 hour in milliseconds

    const loadFromCache = () => {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
            const parsedCache = JSON.parse(cached)
            const now = new Date().getTime()

            // Check if cache is still valid
            if (parsedCache.lastUpdated && (now - parsedCache.lastUpdated) < CACHE_DURATION) {
                weather.value = parsedCache
                return true
            }
        }
        return false
    }

    const saveToCache = () => {
        weather.value.lastUpdated = new Date().getTime()
        localStorage.setItem(CACHE_KEY, JSON.stringify(weather.value))
    }

    const getWeatherIcon = (condition) => {
        const icons = {
            'Clear': '●',
            'Partly cloudy': '◐',
            'Cloudy': '○',
            'Rain': '☂',
            'Snow': '❆',
            'Thunderstorm': '⚡',
            'Mist': '≋',
            'Wind': '⇶',
            'Humidity': '∿'
        }
        return icons[condition] || '●'
    }

    const getWeatherCondition = (code) => {
        const conditions = {
            0: 'Clear',
            1: 'Partly cloudy',
            2: 'Cloudy',
            3: 'Rain',
            4: 'Snow',
            5: 'Thunderstorm',
            6: 'Mist'
        }
        return conditions[code] || 'Clear'
    }

    const fetchWeather = async () => {
        try {
            const response = await fetch(
                "https://api.open-meteo.com/v1/forecast?" +
                "latitude=52.52&longitude=13.41" +
                "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,apparent_temperature" +
                "&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code" +
                "&timezone=auto" +
                "&forecast_days=5" // Reduced from 10 to 5 days to save data
            )
            const data = await response.json()

            weather.value.current = {
                temperature: Math.round(data.current.temperature_2m),
                windSpeed: Math.round(data.current.wind_speed_10m),
                humidity: Math.round(data.current.relative_humidity_2m),
                feelsLike: Math.round(data.current.apparent_temperature),
                condition: getWeatherCondition(data.daily.weather_code[0])
            }

            weather.value.forecast = data.daily.time.map((date, index) => ({
                date,
                maxTemp: Math.round(data.daily.temperature_2m_max[index]),
                minTemp: Math.round(data.daily.temperature_2m_min[index]),
                precipitation: data.daily.precipitation_probability_max[index],
                condition: getWeatherCondition(data.daily.weather_code[index])
            }))

            saveToCache()
        } catch (error) {
            console.error('Error fetching weather:', error)
            // On error, try to load from cache regardless of cache age
            loadFromCache()
        }
    }

    onMounted(() => {
        // First try to load from cache
        if (!loadFromCache()) {
            // If no valid cache exists, fetch fresh data
            fetchWeather()
        }

        // Set up polling interval
        setInterval(fetchWeather, POLL_INTERVAL)
    })

    return {
        weather,
        getWeatherIcon
    }
}