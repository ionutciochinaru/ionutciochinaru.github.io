// components/TodoItem.js
const { ref, computed } = Vue;  // Added computed
import { FocusTimer } from './FocusTimer.js';

export const TodoItem = {
    props: {
        todo: {
            type: Object,
            required: true
        },
        index: {
            type: Number,
            required: true
        },
        readOnly: {
            type: Boolean,
            default: false
        }
    },

    components: {
        FocusTimer
    },

    template: `
      <div class="todo-item" :class="{
            'todo-item--completed': todo.status === 'completed',
            'todo-item--failed': todo.status === 'failed'
        }">
        <!-- Normal View -->
        <template v-if="!isEditing">
          <div class="todo-number">{{ index + 1 }}.</div>
          <div class="todo-actions" v-if="todo.status === 'active'">
            <button
                class="status-button"
                :class="{'status-button--complete': todo.status === 'completed'}"
                @click="toggleStatus('completed')"
                :disabled="readOnly"
            >
              ✓
            </button>
            <button
                class="status-button"
                :class="{'status-button--failed': todo.status === 'failed'}"
                @click="toggleStatus('failed')"
                :disabled="readOnly"
            >
              ✗
            </button>
          </div>
          <div class="todo-content">
            <span class="todo-text">{{ todo.text }}</span>
            <FocusTimer
                v-if="!isCompleted && !isFailed && !readOnly"
                :todo-id="todo.id"
            />
          </div>
          <div class="todo-actions" v-if="!readOnly">
            <button
                @click="startEdit"
                class="action-button"
            >
              ✎
            </button>
            <button
                @click="handleDelete"
                class="action-button"
            >
              ×
            </button>
          </div>
        </template>

        <!-- Edit View -->
        <form
            v-else
            @submit.prevent="handleEdit"
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
      </div>
    `,

    setup(props, { emit }) {
        const isEditing = ref(false);
        const editText = ref('');

        // Add immediate reactivity with computed properties
        const isCompleted = computed(() => props.todo.status === 'completed');
        const isFailed = computed(() => props.todo.status === 'failed');

        const toggleStatus = (newStatus) => {
            // Only emit if status would actually change
            if (props.todo.status !== newStatus) {
                emit('toggle-status', props.todo.id, newStatus);
            } else {
                // If clicking same status, revert to active
                emit('toggle-status', props.todo.id, 'active');
            }
        };

        const handleDelete = () => {
            emit('delete', props.todo.id);
        };

        const startEdit = () => {
            isEditing.value = true;
            editText.value = props.todo.text;
            // Focus input on next tick after it's rendered
            Vue.nextTick(() => {
                const input = document.querySelector('.edit-form .todo-input');
                if (input) input.focus();
            });
        };

        const handleEdit = () => {
            const trimmedText = editText.value.trim();
            if (trimmedText && trimmedText !== props.todo.text) {
                emit('edit', props.todo.id, trimmedText);
            }
            isEditing.value = false;
        };

        const cancelEdit = () => {
            isEditing.value = false;
            editText.value = '';
        };

        return {
            isEditing,
            editText,
            isCompleted,
            isFailed,
            toggleStatus,
            handleDelete,
            startEdit,
            handleEdit,
            cancelEdit
        };
    }
};