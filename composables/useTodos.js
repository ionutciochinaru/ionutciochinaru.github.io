// composables/useTodos.js
const { ref, computed } = Vue;
import {firebaseService} from '../services/firebaseService.js';

export function useTodos() {
    const todos = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    const selectedDate = ref(new Date().toISOString().split('T')[0]);
    const isAddingTodo = ref(false);
    const newTodoText = ref('');
    const editingId = ref(null);
    const editText = ref('');
    const dailyAssessment = ref({
        mood: null,
        notes: '',
        completed_at: null
    });

    // Fetch todos
    const fetchTodos = async (date) => {
        isLoading.value = true;
        error.value = null;

        try {
            todos.value = await firebaseService.getTodosForDate(date);
            console.log(todos.value)
        } catch (err) {
            error.value = 'Error loading todos';
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    };

    // Add todo
    const addTodo = async (todoData) => {
        if (!todoData.text.trim()) return false;

        const newTodo = {
            ...todoData,
            created_at: new Date().toISOString()
        };

        try {
            await firebaseService.addTodo(selectedDate.value, newTodo);
            await fetchTodos(selectedDate.value);
            return true;
        } catch (err) {
            error.value = 'Error adding todo';
            return false;
        }
    };

    // Edit todo
    const editTodo = async (id, newText) => {
        if (!newText.trim()) return false;

        try {
            await firebaseService.editTodo(selectedDate.value, id, newText);
            await fetchTodos(selectedDate.value);
            return true;
        } catch (err) {
            error.value = 'Error editing todo';
            return false;
        }
    };

    // Delete todo
    const deleteTodo = async (id) => {
        try {
            await firebaseService.deleteTodo(selectedDate.value, id);
            await fetchTodos(selectedDate.value);
        } catch (err) {
            error.value = 'Error deleting todo';
        }
    };

    // Toggle todo status
    const toggleTodoStatus = async (id, status) => {
        try {
            await firebaseService.updateTodoStatus(selectedDate.value, id, status);
            await fetchTodos(selectedDate.value);
        } catch (err) {
            error.value = 'Error updating todo status';
            console.error('Error updating todo status:', err);
        }
    };

    // Save daily assessment
    const saveDailyAssessment = async (assessment) => {
        try {
            await firebaseService.saveDailyAssessment(selectedDate.value, assessment);
        } catch (err) {
            error.value = 'Error saving assessment';
        }
    };

    // Change date and fetch data
    const changeDate = async (date) => {
        selectedDate.value = date;
        await fetchTodos(date);

        // Reset daily assessment
        dailyAssessment.value = {
            mood: null,
            notes: '',
            completed_at: null
        };
    };

    // Computed properties
    const incompleteTodos = computed(() =>
        todos.value.filter(todo => !todo.status || todo.status === 'active')
    );

    const completedTodos = computed(() =>
        todos.value.filter(todo => todo.status === 'completed')
    );

    const failedTodos = computed(() =>
        todos.value.filter(todo => todo.status === 'failed')
    );

    return {
        // State
        todos,
        isLoading,
        error,
        selectedDate,
        isAddingTodo,
        newTodoText,
        editingId,
        editText,
        dailyAssessment,

        // Computed
        incompleteTodos,
        completedTodos,
        failedTodos,

        // Methods
        fetchTodos,
        addTodo,
        editTodo,
        deleteTodo,
        toggleTodoStatus,
        saveDailyAssessment,
        changeDate
    };
}