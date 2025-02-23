// components/Achievements.js
const { ref, computed, onMounted } = Vue;
import { useAchievements } from '../composables/useAchievements.js';

export const Achievements = {
    template: `
      <div class="achievements-panel">
        <Loading v-if="isLoading" />
        <template v-else>
          <div class="achievements-header">
            <h3 class="achievements-title">Progress & Achievements</h3>
            <div class="stats-summary">
              <div class="stat-item">
                <div class="stat-value">{{ stats?.totalPomodoros || 0 }}</div>
                <div class="stat-label">Pomodoros</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats?.dailyStreak || 0 }}</div>
                <div class="stat-label">Day Streak</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats?.tasksCompleted || 0 }}</div>
                <div class="stat-label">Tasks Done</div>
              </div>
            </div>
          </div>

          <div class="achievements-list">
            <div v-if="unlockedAchievements.length === 0" class="empty-state">
              No achievements yet. Keep going!
            </div>
            <div
                v-else
                v-for="achievement in unlockedAchievements"
                :key="achievement.id"
                class="achievement"
                :class="{ 'achievement--new': isNewAchievement(achievement) }"
            >
              <div class="achievement__icon">{{ achievement.icon }}</div>
              <div class="achievement__content">
                <div class="achievement__title">{{ achievement.title }}</div>
                <div class="achievement__description">{{ achievement.description }}</div>
              </div>
              <div class="achievement__date">
                {{ formatDate(achievement.unlockedAt) }}
              </div>
            </div>
          </div>

          <div class="next-achievements">
            <h4 class="next-achievements__title">Next Goals</h4>
            <div
                v-for="goal in nextGoals"
                :key="goal.id"
                class="next-goal"
            >
              <div class="next-goal__content">
                <div class="next-goal__title">{{ goal.title }}</div>
                <div class="next-goal__progress">
                  <div
                      class="next-goal__progress-bar"
                      :style="{ width: goal.progress + '%' }"
                  ></div>
                </div>
              </div>
              <div class="next-goal__status">
                {{ goal.current }}/{{ goal.target }}
              </div>
            </div>
          </div>
        </template>
      </div>
    `,

    setup() {
        const {
            achievements,
            isLoading,
            error,
            unlockedAchievements,
            nextGoals,
            progress,
            loadAchievements
        } = useAchievements();

        const stats = computed(() => ({
            totalPomodoros: achievements.value?.totalPomodoros || 0,
            dailyStreak: achievements.value?.dailyStreak || 0,
            tasksCompleted: achievements.value?.totalTasksCompleted || 0
        }));

        const isNewAchievement = (achievement) => {
            if (!achievement.unlockedAt) return false;
            const unlockedAt = new Date(achievement.unlockedAt);
            const now = new Date();
            return (now - unlockedAt) < 60 * 60 * 1000; // 1 hour
        };

        const formatDate = (dateString) => {
            if (!dateString) return '';
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        };

        // Load achievements when component mounts
        onMounted(() => {
            loadAchievements();
        });

        return {
            stats,
            isLoading,
            error,
            unlockedAchievements,
            nextGoals,
            progress,
            isNewAchievement,
            formatDate
        };
    }
};