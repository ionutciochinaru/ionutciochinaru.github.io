const { ref } = Vue

export function useTodos() {
    const todos = ref(JSON.parse(localStorage.getItem('todos') || '[]'))

    const addTodo = () => {
        const text = prompt('New task:')
        if (text) {
            todos.value.push({ text, completed: false })
            saveTodos()
        }
    }

    const saveTodos = () => {
        localStorage.setItem('todos', JSON.stringify(todos.value))
    }

    const completedCount = () => {
        return todos.value.filter(todo => todo.completed).length
    }

    return {
        todos,
        addTodo,
        saveTodos,
        completedCount
    }
}