import {useWeather} from "../composables/useWeather.js";

export const Weather = {
    template: `
      <div class="weather-page">
        <!-- Current temperature - Large display optimized for e-ink -->
        <div class="current-main">
          <div class="temperature-display">{{ weather.current.temperature }}°</div>
          <div class="current-condition">
            {{ getWeatherIcon(weather.current.condition) }} {{ weather.current.condition }}
          </div>
        </div>

        <!-- Weather details with high contrast borders -->
        <div class="current-details">
          <div class="detail-item">
            <div class="detail-value">{{ weather.current.feelsLike }}°</div>
            <div class="detail-label">Feels Like</div>
          </div>
          <div class="detail-item borders">
            <div class="detail-value">{{ weather.current.humidity }}%</div>
            <div class="detail-label">Humidity</div>
          </div>
          <div class="detail-item">
            <div class="detail-value">{{ weather.current.windSpeed }}</div>
            <div class="detail-label">Wind km/h</div>
          </div>
        </div>

        <!-- Forecast with simplified icons and high contrast -->
        <div class="forecast-section">
          <div class="forecast-header">Forecast</div>
          <div class="forecast-list">
            <div v-for="day in weather.forecast"
                 :key="day.date"
                 class="forecast-row">
              <div class="day-name">{{ formatDate(day.date) }}</div>
              <div class="forecast-icon">{{ getWeatherIcon(day.condition) }}</div>
              <div class="forecast-temps">
                <span class="temp-high">{{ day.maxTemp }}°</span>
                <span class="temp-low">{{ day.minTemp }}°</span>
              </div>
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
                weekday: 'short'
            })
        }

        return {
            weather,
            getWeatherIcon,
            formatDate
        }
    }
}