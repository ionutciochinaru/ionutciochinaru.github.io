import { useWeather } from '../composables/useWeather.js'

export const Weather = {
    template: `
        <div class="weather-page">
            <div class="current-weather">
                <div class="weather-main">
                    <div>{{ weather.current.temperature }}°C</div>
                    <div>{{ getWeatherIcon(weather.current.condition) }}</div>
                </div>
                <div class="weather-details">
                    <div class="weather-item">
                        <span>💨</span>
                        <span>Wind: {{ weather.current.windSpeed }} km/h</span>
                    </div>
                    <div class="weather-item">
                        <span>💧</span>
                        <span>Humidity: {{ weather.current.humidity }}%</span>
                    </div>
                </div>
            </div>
            
            <div class="forecast-container">
                <div class="forecast-header">10-Day Forecast</div>
                <div class="forecast-grid">
                    <div v-for="day in weather.forecast" 
                         :key="day.date" 
                         class="forecast-day">
                        <div class="forecast-date">{{ formatDate(day.date) }}</div>
                        <div class="weather-icon">
                            {{ getWeatherIcon(day.condition) }}
                        </div>
                        <div class="forecast-temp">
                            <span class="forecast-high">{{ day.maxTemp }}°</span>
                            <span class="forecast-low">{{ day.minTemp }}°</span>
                        </div>
                        <div>{{ day.precipitation }}%</div>
                    </div>
                </div>
            </div>
        </div>
    `,

    setup() {
        const { weather, getWeatherIcon } = useWeather()

        const formatDate = (dateStr) => {
            const date = new Date(dateStr)
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            })
        }

        return {
            weather,
            getWeatherIcon,
            formatDate
        }
    }
}