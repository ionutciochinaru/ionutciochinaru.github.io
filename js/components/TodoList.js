// TodoList.js
import { useTodos } from '../composables/useTodos.js'

export const TodoList = {
    template: `
      <div class="todo-list">
        <div class="todo-header">
          <h2 class="todo-title">Tasks</h2>
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

        <!-- Todo Section -->
        <div class="section">
          <h3 class="section-title">To Do</h3>
          <div class="todo-items">
            <div v-for="(todo, index) in incompleteTodos"
                 :key="todo.id"
                 class="todo-item">
              <!-- Normal View -->
              <template v-if="editingId !== todo.id">
                <div class="todo-number">{{ index + 1 }}.</div>
                <div class="checkbox-wrapper">
                  <input
                      type="checkbox"
                      :id="'todo-' + todo.id"
                      v-model="todo.completed"
                      @change="toggleTodo(todo.id)"
                      class="todo-checkbox"
                  >
                  <label :for="'todo-' + todo.id" class="checkbox-label">
                    {{ todo.completed ? '☑' : '□' }}
                  </label>
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

        <!-- Section Divider -->
        <div class="section-divider"></div>

        <!-- Done Section -->
        <div class="section">
          <h3 class="section-title">Done</h3>
          <div class="todo-items">
            <div v-for="(todo, index) in completedTodos"
                 :key="todo.id"
                 class="todo-item todo-item--completed">
              <div class="todo-number">{{ index + 1 }}.</div>
              <div class="checkbox-wrapper">
                <input
                    type="checkbox"
                    :id="'todo-' + todo.id"
                    v-model="todo.completed"
                    @change="toggleTodo(todo.id)"
                    class="todo-checkbox"
                >
                <label :for="'todo-' + todo.id" class="checkbox-label">
                  ☑
                </label>
              </div>
              <span class="todo-text">{{ todo.text }}</span>
              <div class="todo-actions">
                <button
                    @click="deleteTodo(todo.id)"
                    class="action-button"
                >
                  ×
                </button>
              </div>
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
            incompleteTodos,
            completedTodos,
            addTodo,
            editTodo,
            deleteTodo,
            toggleTodo
        } = useTodos()

        const handleSubmit = () => {
            if (addTodo(newTodoText.value)) {
                newTodoText.value = ''
                isAddingTodo.value = false
            }
        }

        const cancelAdd = () => {
            isAddingTodo.value = false
            newTodoText.value = ''
        }

        const startEdit = (todo) => {
            editingId.value = todo.id
            editText.value = todo.text
        }

        const handleEdit = (id) => {
            if (editTodo(id, editText.value)) {
                editingId.value = null
                editText.value = ''
            }
        }

        const cancelEdit = () => {
            editingId.value = null
            editText.value = ''
        }

        return {
            // State from composable
            todos,
            isAddingTodo,
            newTodoText,
            editingId,
            editText,
            incompleteTodos,
            completedTodos,

            // Methods from composable
            deleteTodo,
            toggleTodo,

            // Local methods
            handleSubmit,
            cancelAdd,
            startEdit,
            handleEdit,
            cancelEdit
        }
    }
}