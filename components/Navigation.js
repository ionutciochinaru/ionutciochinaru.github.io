export const Navigation = {
    props: {
        currentPage: {
            type: Number,
            required: true
        }
    },

    template: `
      <nav class="nav-container nav-sticky">
        <button
            class="btn btn--medium nav-btn"
            @click="prev"
        >
          ←
        </button>

        <div class="nav-dots">
          <div
              v-for="n in 3"
              :key="n"
              class="nav-dot"
              :class="{
                        'nav-dot-active': currentPage === n - 1
                    }"
              @click="emit('page-change', n - 1)"
          >
          </div>
        </div>

        <button
            class="btn btn--medium nav-btn"
            @click="next"
        >
          →
        </button>
      </nav>
    `,

    setup(props, { emit }) {
        const next = () => {
            emit('page-change', (props.currentPage + 1) % 3)
        }

        const prev = () => {
            if (props.currentPage === 0) {
                emit('page-change', 2)
            } else {
                emit('page-change', props.currentPage - 1)
            }
        }

        return {
            next,
            prev,
            emit
        }
    }
}