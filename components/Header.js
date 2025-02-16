const { ref, onMounted } = Vue
import { useAuth } from '../composables/useAuth.js';

export const Header = {
    template: `
      <header class="header-container">
        <div class="header-content">
          <div class="time-display">
            <div class="time-segment bg-gray-1">{{ hours }}</div>
            <div class="time-separator">:</div>
            <div class="time-segment bg-gray-2">{{ minutes }}</div>
          </div>
          <button
              @click="handleLogout"
              class="logout-button"
              :disabled="loggingOut"
          >
            {{ loggingOut ? 'Logging out...' : 'Logout' }}
          </button>
        </div>
        <div class="header-border"></div>
      </header>
    `,

    setup() {
        const { logout } = useAuth();
        const hours = ref('');
        const minutes = ref('');
        const seconds = ref('');
        const loggingOut = ref(false);

        const updateTime = () => {
            const now = new Date();
            hours.value = now.getHours().toString().padStart(2, '0');
            minutes.value = now.getMinutes().toString().padStart(2, '0');
        };

        const handleLogout = async () => {
            try {
                loggingOut.value = true;
                await logout();
            } catch (error) {
                console.error('Logout error:', error);
            } finally {
                loggingOut.value = false;
            }
        };

        onMounted(() => {
            updateTime();
            setInterval(updateTime, 1000);
        });

        return {
            hours,
            minutes,
            seconds,
            handleLogout,
            loggingOut
        };
    }
};