import { useTodos } from '../composables/useTodos.js'

export const TodoList = {
    template: `
        <div class="todo-list">
            <div class="todo-header">
                <h2>Tasks</h2>
                <button @click="addTodo">+ Add Task</button>
            </div>
            <div class="todo-items">
                <div v-for="(todo, index) in todos" 
                     :key="index" 
                     class="todo-item">
                    <input 
                        type="checkbox" 
                        v-model="todo.completed"
                        @change="saveTodos"
                    >
                    <span :style="{ 
                        textDecoration: todo.completed ? 'line-through' : 'none' 
                    }">
                        {{ todo.text }}
                    </span>
                </div>
            </div>
        </div>
    `,

    setup() {
        const { todos, addTodo, saveTodos } = useTodos()

        return {
            todos,
            addTodo,
            saveTodos
        }
    }
}