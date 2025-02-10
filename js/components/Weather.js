import { useWeather } from '../composables/useWeather.js'

export const Weather = {
    template: `
      <div class="weather-page">
        <div class="current-main">
          <div class="temperature-display">{{ weather.current.temperature }}°</div>
          <div class="weather-icon large">{{ getWeatherIcon(weather.current.condition) }}</div>
        </div>

        <div class="current-details">
          <div class="detail-item">
            <div class="detail-label">Feels Like</div>
            <div class="detail-value">{{ weather.current.feelsLike }}°</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Humidity</div>
            <div class="detail-value">{{ weather.current.humidity }}%</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">{{ weather.current.condition }}</div>
            <div class="detail-value">Now</div>
          </div>
        </div>

        <div class="forecast-section">
          <div class="forecast-header">10-Day Forecast</div>
          <div class="forecast-grid">
            <div v-for="day in weather.forecast" :key="day.date" class="forecast-row">
              <div class="day-name">{{ formatDate(day.date) }}</div>
              <div class="forecast-icon">{{ getWeatherIcon(day.condition) }}</div>
              <div class="forecast-temps">
                <span class="high">{{ day.maxTemp }}°</span>
                <span class="low">{{ day.minTemp }}°</span>
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