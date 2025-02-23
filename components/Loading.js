// components/Loading.js
const { ref, onMounted, onUnmounted } = Vue;

export const Loading = {
    template: `
        <div class="loading-container" :data-state="state">
            <div class="loading-box">
                <div class="loading-text">Loading</div>
                <div class="loading-dots">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                </div>
            </div>
        </div>
    `,

    setup() {
        const state = ref(1);
        let interval;

        onMounted(() => {
            // Slower animation for e-ink display
            interval = setInterval(() => {
                state.value = state.value === 3 ? 1 : state.value + 1;
            }, 500);
        });

        onUnmounted(() => {
            if (interval) {
                clearInterval(interval);
            }
        });

        return {
            state
        };
    }
};