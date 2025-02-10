import { ref, onMounted } from 'vue'

export const Header = {
    template: `
        <header class="header">
            <div>{{ time }}</div>
            <div>100%</div>
        </header>
    `,

    setup() {
        const time = ref('')

        const updateTime = () => {
            time.value = new Date().toLocaleTimeString('en-US', { hour12: false })
        }

        onMounted(() => {
            updateTime()
            setInterval(updateTime, 1000)
        })

        return {
            time
        }
    }
}