// components/FocusTimer.js
const { ref, computed, onUnmounted } = Vue;
import { useFocus } from '../composables/useFocus.js';

export const FocusTimer = {
    props: {
        todoId: {
            type: String,
            required: true
        }
    },

    template: `
      <div class="focus-timer" :class="{ 'focus-timer--active': isActive, 'focus-timer--break': isBreak }">
        <div v-if="!isActive" class="focus-timer__start">
          <button
              @click="handleStartFocus"
              class="focus-button focus-button--start"
          >
            Start Focus
          </button>
        </div>
        <div v-else class="focus-timer__active">
          <div class="focus-timer__display">
            <div class="focus-timer__time">{{ formattedTimeRemaining }}</div>
            <div class="focus-timer__status">
              {{ isBreak ? 'Break Time!' : 'Focusing...' }}
            </div>
          </div>
          <div class="focus-timer__progress">
            <div
                class="focus-timer__progress-bar"
                :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
          <div class="focus-timer__controls">
            <button
                v-if="!timerInterval"
                @click="handleResume"
                class="focus-button focus-button--resume"
            >
              Resume
            </button>
            <button
                v-else
                @click="handlePause"
                class="focus-button focus-button--pause"
            >
              Pause
            </button>
          </div>
        </div>
      </div>
    `,

    setup(props) {
        const {
            activeTimer,
            timeRemaining,
            isBreak,
            formattedTimeRemaining,
            progressPercentage,
            startFocus,
            pauseFocus,
            resumeFocus,
            completeFocusSession,
            timerInterval
        } = useFocus();

        const isActive = computed(() => activeTimer.value === props.todoId);

        const handleStartFocus = () => {
            startFocus(props.todoId);
        };

        const handlePause = () => {
            pauseFocus();
        };

        const handleResume = () => {
            resumeFocus();
        };

        // Cleanup on component unmount
        onUnmounted(() => {
            if (isActive.value) {
                completeFocusSession();
            }
        });

        return {
            isActive,
            isBreak,
            timerInterval,
            formattedTimeRemaining,
            progressPercentage,
            handleStartFocus,
            handlePause,
            handleResume
        };
    }
};