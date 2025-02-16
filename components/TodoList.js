// components/TodoList.js
const { ref, computed, onMounted } = Vue;
import { useTodos } from '../composables/useTodos.js';

export const TodoList = {
    template: `
      <div class="todo-container">
        <!-- Calendar Strip -->
        <div class="calendar-strip">
          <button
              class="calendar-nav"
              @click="previousDay"
          >←</button>
          <div class="calendar-days">
            <div
                v-for="date in calendarDays"
                :key="date.date"
                class="calendar-day"
                :class="{
                'calendar-day--selected': isSelectedDay(date.date),
                'calendar-day--today': isToday(date.date)
              }"
                @click="selectDay(date.date)"
            >
              <div class="day-name">{{ formatDay(date.date) }}</div>
              <div class="day-number">{{ formatDate(date.date) }}</div>
              <div
                  v-if="date.hasTodos"
                  class="day-indicator"
              ></div>
            </div>
          </div>
          <button
              class="calendar-nav"
              @click="nextDay"
          >→</button>
        </div>

        <!-- Todo List -->
        <div class="todo-list">
          <div class="todo-header">
            <h2 class="todo-title">Tasks for {{ formatSelectedDate }}</h2>
            <button
                v-if="!isAddingTodo"
                @click="isAddingTodo = true"
                class="add-button"
            >
              <span class="button-icon">+</span>
              <span class="button-text">Add Task</span>
            </button>
          </div>

          <!-- Add Todo Form -->
          <form
              v-if="isAddingTodo"
              class="add-todo-form"
              @submit.prevent="handleSubmit"
          >
            <input
                type="text"
                v-model="newTodoText"
                placeholder="Enter new task..."
                class="todo-input"
                ref="todoInput"
            >
            <div class="form-buttons">
              <button
                  type="button"
                  @click="cancelAdd"
                  class="cancel-button"
              >
                Cancel
              </button>
              <button
                  type="submit"
                  class="submit-button"
              >
                Add
              </button>
            </div>
          </form>

          <!-- Active Todos -->
          <div class="section">
            <h3 class="section-title">To Do</h3>
            <div class="todo-items">
              <div v-for="(todo, index) in incompleteTodos"
                   :key="todo.id"
                   class="todo-item">
                <!-- Normal View -->
                <template v-if="editingId !== todo.id">
                  <div class="todo-number">{{ index + 1 }}.</div>
                  <div class="todo-actions">
                    <button
                        class="status-button"
                        :class="{'status-button--complete': todo.completed}"
                        @click="toggleTodoStatus(todo.id, 'completed')"
                    >
                      ✓
                    </button>
                    <button
                        class="status-button"
                        :class="{'status-button--failed': todo.failed}"
                        @click="toggleTodoStatus(todo.id, 'failed')"
                    >
                      ✗
                    </button>
                  </div>
                  <span class="todo-text">{{ todo.text }}</span>
                  <div class="todo-actions">
                    <button
                        @click="startEdit(todo)"
                        class="action-button"
                    >
                      ✎
                    </button>
                    <button
                        @click="deleteTodo(todo.id)"
                        class="action-button"
                    >
                      ×
                    </button>
                  </div>
                </template>

                <!-- Edit View -->
                <template v-else>
                  <form
                      @submit.prevent="handleEdit(todo.id)"
                      class="edit-form"
                  >
                    <input
                        type="text"
                        v-model="editText"
                        class="todo-input"
                        ref="editInput"
                    >
                    <div class="form-buttons">
                      <button
                          type="button"
                          @click="cancelEdit"
                          class="cancel-button"
                      >
                        Cancel
                      </button>
                      <button
                          type="submit"
                          class="submit-button"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </template>
              </div>
            </div>
          </div>

          <!-- Completed Todos -->
          <div class="section" v-if="completedTodos.length">
            <h3 class="section-title">Completed</h3>
            <div class="todo-items">
              <div v-for="todo in completedTodos"
                   :key="todo.id"
                   class="todo-item todo-item--completed">
                <span class="todo-text">{{ todo.text }}</span>
                <div class="todo-time">{{ formatTime(todo.completedAt) }}</div>
              </div>
            </div>
          </div>

          <!-- Failed Todos -->
          <div class="section" v-if="failedTodos.length">
            <h3 class="section-title">Failed</h3>
            <div class="todo-items">
              <div v-for="todo in failedTodos"
                   :key="todo.id"
                   class="todo-item todo-item--failed">
                <span class="todo-text">{{ todo.text }}</span>
              </div>
            </div>
          </div>

          <!-- Daily Assessment -->
          <div class="assessment-section" v-if="shouldShowAssessment">
            <h3 class="section-title">Daily Assessment</h3>
            <div class="assessment-form">
              <div class="mood-selector">
                <div class="mood-label">How was your day?</div>
                <div class="mood-buttons">
                  <button
                      v-for="mood in moods"
                      :key="mood.value"
                      class="mood-button"
                      :class="{ 'mood-button--selected': dailyAssessment.mood === mood.value }"
                      @click="selectMood(mood.value)"
                  >
                    {{ mood.icon }}
                  </button>
                </div>
              </div>
              <textarea
                  v-model="dailyAssessment.notes"
                  class="assessment-notes"
                  placeholder="Any notes about your day?"
              ></textarea>
              <button
                  @click="saveAssessment"
                  class="save-assessment-button"
                  :disabled="!dailyAssessment.mood"
              >
                Save Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    `,

    setup() {
        const {
            todos,
            isAddingTodo,
            newTodoText,
            editingId,
            editText,
            selectedDate,
            dailyAssessment,
            incompleteTodos,
            completedTodos,
            failedTodos,
            addTodo,
            editTodo,
            deleteTodo,
            toggleTodoStatus,
            saveDailyAssessment,
            changeDate
        } = useTodos();

        // Calendar logic
        const calendarDays = computed(() => {
            const days = [];
            const currentDate = new Date(selectedDate.value);

            // Add previous 3 days
            for (let i = 3; i > 0; i--) {
                const date = new Date(currentDate);
                date.setDate(date.getDate() - i);
                days.push({
                    date: date.toISOString().split('T')[0],
                    hasTodos: false
                });
            }

            // Add current day
            days.push({
                date: currentDate.toISOString().split('T')[0],
                hasTodos: false
            });

            // Add next 3 days
            for (let i = 1; i <= 3; i++) {
                const date = new Date(currentDate);
                date.setDate(date.getDate() + i);
                days.push({
                    date: date.toISOString().split('T')[0],
                    hasTodos: false
                });
            }

            return days;
        });

        const moods = [
            { value: 1, icon: '😢' },
            { value: 2, icon: '😕' },
            { value: 3, icon: '😐' },
            { value: 4, icon: '🙂' },
            { value: 5, icon: '😄' }
        ];

        // Computed properties
        const shouldShowAssessment = computed(() => {
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            return selectedDate.value === today && now.getHours() >= 20;
        });

        const formatSelectedDate = computed(() => {
            return new Date(selectedDate.value).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        });

        // Methods
        const selectDay = async (date) => {
            await changeDate(date);
        };

        const previousDay = () => {
            const date = new Date(selectedDate.value);
            date.setDate(date.getDate() - 1);
            selectDay(date.toISOString().split('T')[0]);
        };

        const nextDay = () => {
            const date = new Date(selectedDate.value);
            date.setDate(date.getDate() + 1);
            selectDay(date.toISOString().split('T')[0]);
        };

        const isSelectedDay = (date) => {
            return date === selectedDate.value;
        };

        const isToday = (date) => {
            const today = new Date().toISOString().split('T')[0];
            return date === today;
        };

        const formatDay = (dateStr) => {
            return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
        };

        const formatDate = (dateStr) => {
            return new Date(dateStr).getDate();
        };

        const formatTime = (timestamp) => {
            if (!timestamp) return '';
            return new Date(timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        const handleSubmit = () => {
            if (addTodo(newTodoText.value)) {
                newTodoText.value = '';
                isAddingTodo.value = false;
            }
        };

        const cancelAdd = () => {
            isAddingTodo.value = false;
            newTodoText.value = '';
        };

        const startEdit = (todo) => {
            editingId.value = todo.id;
            editText.value = todo.text;
        };

        const handleEdit = (id) => {
            if (editTodo(id, editText.value)) {
                editingId.value = null;
                editText.value = '';
            }
        };

        const cancelEdit = () => {
            editingId.value = null;
            editText.value = '';
        };

        const selectMood = (mood) => {
            dailyAssessment.value.mood = mood;
        };

        const saveAssessment = async () => {
            await saveDailyAssessment(dailyAssessment.value);
        };

        // Lifecycle
        onMounted(async () => {
            await selectDay(new Date().toISOString().split('T')[0]);
        });

        return {
            // State
            todos,
            isAddingTodo,
            newTodoText,
            editingId,
            editText,
            selectedDate,
            dailyAssessment,
            calendarDays,
            moods,

            // Computed
            incompleteTodos,
            completedTodos,
            failedTodos,
            shouldShowAssessment,
            formatSelectedDate,

            // Methods
            handleSubmit,
            cancelAdd,
            startEdit,
            handleEdit,
            cancelEdit,
            deleteTodo,
            toggleTodoStatus,
            selectDay,
            previousDay,
            nextDay,
            isSelectedDay,
            isToday,
            formatDay,
            formatDate,
            formatTime,
            selectMood,
            saveAssessment
        };
    }
};