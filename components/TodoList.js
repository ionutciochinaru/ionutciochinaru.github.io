// components/TodoList.js
const {ref, computed, onMounted} = Vue;
import {useTodos} from '../composables/useTodos.js';
import {TodoItem} from './TodoItem.js';
import {Loading} from './Loading.js';
import {auth} from '../firebaseConfig.js';  // Add this import
import {collection, getDocs} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import {db} from '../firebaseConfig.js';

export const TodoList = {
    components: {
        TodoItem,
        Loading
    },

    template: `
      <div class="todo-container">
        <Loading v-if="isLoading"/>

        <div v-else>
          <!-- Calendar Strip -->
          <div class="calendar-strip">
            <button
                class="calendar-nav"
                @click="previousDay"
            >←
            </button>
            <div class="calendar-days">
              <div
                  v-for="date in calendarDays"
                  :key="date.date"
                  class="calendar-day"
                  :class="{
                                'calendar-day--selected': isSelectedDay(date.date),
                                'calendar-day--today': isToday(date.date),
                            }"
                  @click="selectDay(date.date)"
              >
                <div class="day-name">{{ formatDay(date.date) }}</div>
                <div class="day-number">{{ formatDate(date.date) }}</div>
              </div>
            </div>
            <button
                class="calendar-nav"
                @click="nextDay"
            >→
            </button>
          </div>

          <!-- Todo List -->
          <div class="todo-header">
            <h2 class="todo-title">Tasks for {{ formatSelectedDate }}</h2>
            <button
                v-if="!isAddingTodo && !isReadOnly"
                @click="isAddingTodo = true"
                class="add-button"
            >
              <span class="button-icon">+</span>
              <span class="button-text">Add Task</span>
            </button>
          </div>

          <!-- Add Todo Form -->
          <form
              v-if="isAddingTodo && !isReadOnly"
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
            <div class="energy-level">
              <label>Energy Level Required:</label>
              <div class="energy-buttons">
                <button
                    v-for="level in energyLevels"
                    :key="level.value"
                    type="button"
                    :class="['energy-button', { 'energy-button--selected': selectedEnergy === level.value }]"
                    @click="selectedEnergy = level.value"
                >
                  {{ level.icon }}
                </button>
              </div>
            </div>
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
                  :disabled="!newTodoText.trim() || !selectedEnergy"
              >
                Add
              </button>
            </div>
          </form>

          <!-- Active Todos -->
          <div class="section">
            <h3 class="section-title">To Do</h3>
            <div v-if="incompleteTodos.length" class="todo-items">
              <TodoItem
                  v-for="(todo, index) in incompleteTodos"
                  :key="todo.id"
                  :todo="todo"
                  :index="index"
                  :read-only="isReadOnly"
                  @toggle-status="toggleTodoStatus"
                  @edit="handleEdit"
                  @delete="deleteTodo"
              />
            </div>
            <div v-else class="empty-state">
              No active tasks
            </div>
          </div>

          <!-- Completed Todos -->
          <div v-if="completedTodos.length" class="section">
            <h3 class="section-title">Completed</h3>
            <div class="todo-items">
              <TodoItem
                  v-for="(todo, index) in completedTodos"
                  :key="todo.id"
                  :index="index"
                  :todo="todo"
                  :read-only="true"
              />
            </div>
          </div>

          <!-- Failed Todos -->
          <div v-if="failedTodos.length" class="section">
            <h3 class="section-title">Not Completed</h3>
            <div class="todo-items">
              <TodoItem
                  v-for="(todo, index) in failedTodos"
                  :key="todo.id"
                  :index="index"
                  :todo="todo"
                  :read-only="true"
              />
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
                      type="button"
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
            isLoading,
            error,
            selectedDate,
            isAddingTodo,
            newTodoText,
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

        const selectedEnergy = ref(null);

        const energyLevels = [
            {value: 'high', name: 'High', icon: '⚡'},
            {value: 'medium', name: 'Medium', icon: '💪'},
            {value: 'low', name: 'Low', icon: '🌱'}
        ];

        const moods = [
            {value: 1, icon: '😢'},
            {value: 2, icon: '😕'},
            {value: 3, icon: '😐'},
            {value: 4, icon: '🙂'},
            {value: 5, icon: '😄'}
        ];

        // Calendar computed properties
        const calendarDays = computed(() => {
            const days = [];
            const currentDate = new Date(selectedDate.value);

            // Add previous 3 days
            for (let i = 3; i > 0; i--) {
                const date = new Date(currentDate);
                date.setDate(date.getDate() - i);
                days.push({
                    date: date.toISOString().split('T')[0]
                });
            }

            // Add current day
            days.push({
                date: currentDate.toISOString().split('T')[0]
            });

            // Add next 3 days
            for (let i = 1; i <= 3; i++) {
                const date = new Date(currentDate);
                date.setDate(date.getDate() + i);
                days.push({
                    date: date.toISOString().split('T')[0]
                });
            }

            return days;
        });

        const isReadOnly = computed(() => {
            const today = new Date().toISOString().split('T')[0];
            return selectedDate.value < today;
        });

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

        // Calendar methods

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

        const hasTodosForDate = (date) => {
            const dateString = date instanceof Date ?
                date.toISOString().split('T')[0] :
                date;

            // First check our cached data
            if (todosByDate.value.has(dateString)) {
                return todosByDate.value.get(dateString).length > 0;
            }

            // If no cached data, check the currently loaded todos
            if (selectedDate.value === dateString) {
                return todos.value.length > 0;
            }

            return false;
        };

        // Todo methods
        const handleSubmit = async () => {
            if (newTodoText.value.trim() && selectedEnergy.value) {
                await addTodo({
                    text: newTodoText.value.trim(),
                    energyLevel: selectedEnergy.value
                });
                newTodoText.value = '';
                selectedEnergy.value = null;
                isAddingTodo.value = false;
            }
        };

        const cancelAdd = () => {
            isAddingTodo.value = false;
            newTodoText.value = '';
            selectedEnergy.value = null;
        };

        const handleEdit = async (id, text) => {
            await editTodo(id, text);
        };

        const selectMood = (mood) => {
            dailyAssessment.value.mood = mood;
        };

        const saveAssessment = async () => {
            if (dailyAssessment.value.mood) {
                await saveDailyAssessment(dailyAssessment.value);
            }
        };

        // Load initial todos
        onMounted(() => {
            const today = new Date().toISOString().split('T')[0];
            selectDay(today);
        });

        return {
            // State
            isLoading,
            error,
            selectedDate,
            isAddingTodo,
            newTodoText,
            selectedEnergy,
            dailyAssessment,
            energyLevels,
            moods,

            // Computed
            incompleteTodos,
            completedTodos,
            failedTodos,
            isReadOnly,
            shouldShowAssessment,
            calendarDays,
            formatSelectedDate,

            // Calendar Methods
            selectDay,
            previousDay,
            nextDay,
            isSelectedDay,
            isToday,
            formatDay,
            formatDate,

            // Todo Methods
            handleSubmit,
            cancelAdd,
            handleEdit,
            deleteTodo,
            toggleTodoStatus,
            selectMood,
            saveAssessment
        };
    }
};