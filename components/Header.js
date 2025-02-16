const { ref, onMounted } = Vue

export const Header = {
    template: `
      <header class="header-container">
        <div class="header-content">
          <div class="time-display">
            <div class="time-segment bg-gray-1">{{ hours }}</div>
            <div class="time-separator">:</div>
            <div class="time-segment bg-gray-2">{{ minutes }}</div>
          </div>
        </div>
        <div class="header-border"></div>
      </header>
    `,

    setup() {
        const hours = ref('')
        const minutes = ref('')
        const seconds = ref('')

        const updateTime = () => {
            const now = new Date()
            hours.value = now.getHours().toString().padStart(2, '0')
            minutes.value = now.getMinutes().toString().padStart(2, '0')
        }

        onMounted(() => {
            updateTime()
            setInterval(updateTime, 1000)
        })

        return {
            hours,
            minutes,
            seconds
        }
    }
}