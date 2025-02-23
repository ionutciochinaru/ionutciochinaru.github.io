// composables/useAchievements.js
const { ref, computed } = Vue;
import { firebaseService } from '../services/firebaseService.js';

export function useAchievements() {
    const achievements = ref({
        dailyStreak: 0,
        totalPomodoros: 0,
        totalTasksCompleted: 0,
        unlocked: []
    });

    const isLoading = ref(false);
    const error = ref(null);

    // Achievement definitions
    const achievementsList = [
        {
            id: 'first_todo',
            title: 'Getting Started',
            description: 'Complete your first todo',
            condition: stats => stats.totalTasksCompleted >= 1,
            icon: '🎯'
        },
        {
            id: 'focus_master',
            title: 'Focus Master',
            description: 'Complete 25 pomodoros',
            condition: stats => stats.totalPomodoros >= 25,
            icon: '⚡'
        },
        {
            id: 'productive_day',
            title: 'Productive Day',
            description: 'Complete 8 tasks in a single day',
            condition: stats => stats.dailyTasksCompleted >= 8,
            icon: '🌟'
        },
        {
            id: 'consistency',
            title: 'Consistency Champion',
            description: 'Maintain a 7-day streak',
            condition: stats => stats.dailyStreak >= 7,
            icon: '🔥'
        },
        {
            id: 'deep_work',
            title: 'Deep Work Master',
            description: 'Complete 4 pomodoros without breaks',
            condition: stats => stats.consecutivePomodoros >= 4,
            icon: '🧠'
        }
    ];

    // Load achievements from Firebase
    const loadAchievements = async () => {
        isLoading.value = true;
        try {
            const data = await firebaseService.getAchievements();
            if (data) {
                achievements.value = data;
            }
        } catch (err) {
            error.value = 'Error loading achievements';
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    };

    // Check for new achievements
    const checkAchievements = async (stats) => {
        const newAchievements = achievementsList.filter(achievement => {
            // Check if achievement is not already unlocked
            const notUnlocked = !achievements.value.unlocked.some(a => a.id === achievement.id);
            // Check if condition is met
            const conditionMet = achievement.condition(stats);
            return notUnlocked && conditionMet;
        });

        // Unlock new achievements
        for (const achievement of newAchievements) {
            await unlockAchievement(achievement);
        }

        return newAchievements;
    };

    // Unlock a new achievement
    const unlockAchievement = async (achievement) => {
        try {
            await firebaseService.unlockAchievement({
                ...achievement,
                unlockedAt: new Date().toISOString()
            });

            achievements.value.unlocked.push({
                ...achievement,
                unlockedAt: new Date().toISOString()
            });

            // Show achievement notification
            showAchievementNotification(achievement);
        } catch (err) {
            console.error('Error unlocking achievement:', err);
        }
    };

    // Show achievement notification (e-ink friendly)
    const showAchievementNotification = (achievement) => {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
            </div>
        `;
        document.body.appendChild(notification);

        // Remove after a delay
        setTimeout(() => {
            notification.classList.add('achievement-notification--hide');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    };

    // Computed properties
    const unlockedAchievements = computed(() =>
        achievements.value.unlocked.sort((a, b) =>
            new Date(b.unlockedAt) - new Date(a.unlockedAt))
    );

    const nextAchievements = computed(() => {
        return achievementsList.filter(achievement =>
            !achievements.value.unlocked.some(a => a.id === achievement.id)
        );
    });

    const progress = computed(() => ({
        totalAchievements: achievementsList.length,
        unlockedCount: achievements.value.unlocked.length,
        percentage: (achievements.value.unlocked.length / achievementsList.length) * 100
    }));

    return {
        // State
        achievements,
        isLoading,
        error,

        // Computed
        unlockedAchievements,
        nextAchievements,
        progress,

        // Methods
        loadAchievements,
        checkAchievements
    };
}