export const Navigation = {
    props: {
        currentPage: {
            type: Number,
            required: true
        }
    },

    template: `
        <nav class="nav">
            <button @click="prev">←</button>
            <div class="nav-dots">
                <div v-for="n in 3" 
                     :key="n"
                     :class="['nav-dot', { active: currentPage === n - 1 }]">
                </div>
            </div>
            <button @click="next">→</button>
        </nav>
    `,

    setup(props, { emit }) {
        const next = () => {
            emit('page-change', (props.currentPage + 1) % 3)
        }

        const prev = () => {
            emit('page-change', (props.currentPage - 1 + 3) % 3)
        }

        return {
            next,
            prev
        }
    }
}