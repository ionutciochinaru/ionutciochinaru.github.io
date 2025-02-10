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
        forecast: []
    })

    const getWeatherIcon = (condition) => {
        const icons = {
            'Clear': '●',               // Solid circle for sun
            'Partly cloudy': '◐',       // Half circle for partial clouds
            'Cloudy': '○',              // Empty circle for full cloud cover
            'Rain': '☂',                // Umbrella for rain
            'Snow': '❆',                // Snowflake for snow
            'Thunderstorm': '⚡',        // Lightning bolt for thunderstorm
            'Mist': '≋',                // Waves for mist/fog
            'Wind': '⇶',                // Wind direction arrow
            'Humidity': '∿'             // Wave for humidity
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
                "&forecast_days=10"
            )
            const data = await response.json()

            weather.value.current = {
                temperature: Math.round(data.current.temperature_2m),
                windSpeed: Math.round(data.current.wind_speed_10m),
                humidity: Math.round(data.current.relative_humidity_2m),
                feelsLike: Math.round(data.current.apparent_temperature),
                condition: getWeatherCondition(data.daily.weather_code[0]),
                uv: 0
            }

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
        setInterval(fetchWeather, 30 * 60 * 1000)
    })

    return {
        weather,
        getWeatherIcon
    }
}