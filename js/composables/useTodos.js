// useTodos.js
const { ref, computed } = Vue

export function useTodos() {
    const todos = ref(JSON.parse(localStorage.getItem('todos') || '[]'))
    const isAddingTodo = ref(false)
    const newTodoText = ref('')
    const editingId = ref(null)
    const editText = ref('')
    const nextId = ref(JSON.parse(localStorage.getItem('nextId') || '1'))

    // Computed properties
    const incompleteTodos = computed(() =>
        todos.value.filter(todo => !todo.completed)
    )

    const completedTodos = computed(() =>
        todos.value.filter(todo => todo.completed)
    )

    const completedCount = computed(() =>
        completedTodos.value.length
    )

    // Methods
    const saveTodos = () => {
        localStorage.setItem('todos', JSON.stringify(todos.value))
        localStorage.setItem('nextId', JSON.stringify(nextId.value))
    }

    const addTodo = (text) => {
        if (text.trim()) {
            todos.value.push({
                id: nextId.value++,
                text: text.trim(),
                completed: false
            })
            saveTodos()
            return true
        }
        return false
    }

    const editTodo = (id, newText) => {
        if (newText.trim()) {
            const todo = todos.value.find(t => t.id === id)
            if (todo) {
                todo.text = newText.trim()
                saveTodos()
                return true
            }
        }
        return false
    }

    const deleteTodo = (id) => {
        const index = todos.value.findIndex(t => t.id === id)
        if (index !== -1) {
            todos.value.splice(index, 1)
            saveTodos()
        }
    }

    const toggleTodo = (id) => {
        const todo = todos.value.find(t => t.id === id)
        if (todo) {
            todo.completed = !todo.completed
            saveTodos()
        }
    }

    return {
        // State
        todos,
        isAddingTodo,
        newTodoText,
        editingId,
        editText,

        // Computed
        incompleteTodos,
        completedTodos,
        completedCount,

        // Methods
        addTodo,
        editTodo,
        deleteTodo,
        toggleTodo,
        saveTodos
    }
}