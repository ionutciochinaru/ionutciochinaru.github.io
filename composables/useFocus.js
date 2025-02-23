// composables/useFocus.js
const { ref, computed, onUnmounted } = Vue;
import { firebaseService } from '../services/firebaseService.js';

export function useFocus() {
    const activeTimer = ref(null);
    const timeRemaining = ref(0);
    const isBreak = ref(false);
    const pomodoroCount = ref(0);
    const lastSessionStart = ref(null);
    const isLoading = ref(false);
    const error = ref(null);

    const settings = ref({
        focusDuration: 25 * 60, // 25 minutes in seconds
        shortBreak: 5 * 60,     // 5 minutes
        longBreak: 15 * 60,     // 15 minutes
        pomodorsUntilLongBreak: 4
    });

    const timerInterval = ref(null);

    // Keep track of offline focus sessions
    const offlineSessions = ref([]);
    const isOnline = ref(navigator.onLine);

    // Watch online status
    window.addEventListener('online', () => {
        isOnline.value = true;
        syncOfflineSessions();
    });
    window.addEventListener('offline', () => {
        isOnline.value = false;
    });

    // Computed Properties
    const formattedTimeRemaining = computed(() => {
        const minutes = Math.floor(timeRemaining.value / 60);
        const seconds = timeRemaining.value % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    });

    const progressPercentage = computed(() => {
        const total = isBreak.value
            ? (pomodoroCount.value % 4 === 0 ? settings.value.longBreak : settings.value.shortBreak)
            : settings.value.focusDuration;
        return ((total - timeRemaining.value) / total) * 100;
    });

    // Methods
    const startFocus = async (todoId) => {
        if (activeTimer.value) return;

        activeTimer.value = todoId;
        timeRemaining.value = settings.value.focusDuration;
        isBreak.value = false;
        lastSessionStart.value = new Date();

        startTimer();
    };

    const startTimer = () => {
        timerInterval.value = setInterval(() => {
            if (timeRemaining.value > 0) {
                timeRemaining.value--;
            } else {
                completeFocusSession();
            }
        }, 1000);
    };

    const pauseFocus = () => {
        if (timerInterval.value) {
            clearInterval(timerInterval.value);
            timerInterval.value = null;
        }
    };

    const resumeFocus = () => {
        if (!timerInterval.value && timeRemaining.value > 0) {
            startTimer();
        }
    };

    const completeFocusSession = async () => {
        clearInterval(timerInterval.value);
        timerInterval.value = null;

        if (!isBreak.value) {
            const sessionDuration = Math.floor((new Date() - lastSessionStart.value) / 1000);
            pomodoroCount.value++;

            if (isOnline.value) {
                try {
                    await firebaseService.recordPomodoroSession(
                        activeTimer.value,
                        sessionDuration
                    );
                } catch (error) {
                    storeOfflineSession(activeTimer.value, sessionDuration);
                }
            } else {
                storeOfflineSession(activeTimer.value, sessionDuration);
            }

            startBreak();
        } else {
            activeTimer.value = null;
            isBreak.value = false;
        }
    };

    const startBreak = () => {
        isBreak.value = true;
        if (pomodoroCount.value % 4 === 0) {
            timeRemaining.value = settings.value.longBreak;
        } else {
            timeRemaining.value = settings.value.shortBreak;
        }

        startTimer();
    };

    const storeOfflineSession = (todoId, duration) => {
        offlineSessions.value.push({
            todoId,
            duration,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('offlineSessions', JSON.stringify(offlineSessions.value));
    };

    const syncOfflineSessions = async () => {
        if (offlineSessions.value.length === 0) return;

        isLoading.value = true;

        for (const session of offlineSessions.value) {
            try {
                await firebaseService.recordPomodoroSession(
                    session.todoId,
                    session.duration
                );
            } catch (err) {
                console.error('Error syncing focus session:', err);
            }
        }

        offlineSessions.value = [];
        localStorage.removeItem('offlineSessions');
        isLoading.value = false;
    };

    // Load offline sessions from localStorage
    const storedSessions = localStorage.getItem('offlineSessions');
    if (storedSessions) {
        offlineSessions.value = JSON.parse(storedSessions);
    }

    // Load user settings
    const loadSettings = async () => {
        try {
            const userSettings = await firebaseService.getUserSettings();
            if (userSettings?.pomodoro) {
                settings.value = {
                    ...settings.value,
                    ...userSettings.pomodoro
                };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    // Cleanup
    onUnmounted(() => {
        if (timerInterval.value) {
            clearInterval(timerInterval.value);
        }
    });

    return {
        // State
        activeTimer,
        timeRemaining,
        isBreak,
        pomodoroCount,
        settings,
        isLoading,
        error,
        isOnline,

        // Computed
        formattedTimeRemaining,
        progressPercentage,

        // Methods
        startFocus,
        pauseFocus,
        resumeFocus,
        completeFocusSession,
        loadSettings
    };
}