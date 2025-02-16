// composables/useTodos.js
const { ref, computed } = Vue;
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    orderBy,
    getDoc
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { db, auth } from '../firebaseConfig.js';

export function useTodos() {
    const todos = ref([]);
    const isAddingTodo = ref(false);
    const newTodoText = ref('');
    const editingId = ref(null);
    const editText = ref('');
    const selectedDate = ref(new Date().toISOString().split('T')[0]); // Format: YYYY-MM-DD
    const dailyAssessment = ref({
        mood: null,
        notes: '',
        completed_at: null
    });

    // Get todos for a specific date
    const fetchTodos = async (date) => {
        if (!auth.currentUser) return;

        const todosRef = collection(db, 'users', auth.currentUser.uid, 'days', date, 'todos');
        const q = query(todosRef, orderBy('created_at', 'asc'));

        try {
            const querySnapshot = await getDocs(q);
            todos.value = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching todos:', error);
        }
    };

    // Fetch assessment for a specific date
    const fetchAssessment = async (date) => {
        if (!auth.currentUser) return;

        const assessmentRef = doc(db, 'users', auth.currentUser.uid, 'days', date);
        try {
            const docSnap = await getDoc(assessmentRef);
            if (docSnap.exists()) {
                dailyAssessment.value = docSnap.data().assessment || {
                    mood: null,
                    notes: '',
                    completed_at: null
                };
            }
        } catch (error) {
            console.error('Error fetching assessment:', error);
        }
    };

    // Change selected date and fetch data
    const changeDate = async (date) => {
        selectedDate.value = date;
        await Promise.all([
            fetchTodos(date),
            fetchAssessment(date)
        ]);
    };

    // Add new todo
    const addTodo = async (text) => {
        if (!text.trim() || !auth.currentUser) return false;

        const todoData = {
            text: text.trim(),
            completed: false,
            failed: false,
            created_at: new Date().toISOString(),
            completed_at: null,
            user_id: auth.currentUser.uid,
            date: selectedDate.value
        };

        try {
            const todosRef = collection(db, 'users', auth.currentUser.uid, 'days', selectedDate.value, 'todos');
            await addDoc(todosRef, todoData);
            await fetchTodos(selectedDate.value);
            return true;
        } catch (error) {
            console.error('Error adding todo:', error);
            return false;
        }
    };

    // Edit todo
    const editTodo = async (id, newText) => {
        if (!newText.trim() || !auth.currentUser) return false;

        try {
            const todoRef = doc(db, 'users', auth.currentUser.uid, 'days', selectedDate.value, 'todos', id);
            await updateDoc(todoRef, {
                text: newText.trim()
            });
            await fetchTodos(selectedDate.value);
            return true;
        } catch (error) {
            console.error('Error editing todo:', error);
            return false;
        }
    };

    // Toggle todo status
    const toggleTodoStatus = async (id, status) => {
        if (!auth.currentUser) return;

        try {
            const todoRef = doc(db, 'users', auth.currentUser.uid, 'days', selectedDate.value, 'todos', id);
            await updateDoc(todoRef, {
                completed: status === 'completed',
                failed: status === 'failed',
                completed_at: status === 'completed' ? new Date().toISOString() : null
            });
            await fetchTodos(selectedDate.value);
        } catch (error) {
            console.error('Error updating todo status:', error);
        }
    };

    // Delete todo
    const deleteTodo = async (id) => {
        if (!auth.currentUser) return;

        try {
            const todoRef = doc(db, 'users', auth.currentUser.uid, 'days', selectedDate.value, 'todos', id);
            await deleteDoc(todoRef);
            await fetchTodos(selectedDate.value);
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    };

    // Save daily assessment
    const saveDailyAssessment = async (assessment) => {
        if (!auth.currentUser) return;

        try {
            const dayRef = doc(db, 'users', auth.currentUser.uid, 'days', selectedDate.value);
            await updateDoc(dayRef, {
                assessment: {
                    ...assessment,
                    completed_at: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Error saving assessment:', error);
        }
    };

    // Computed properties
    const incompleteTodos = computed(() =>
        todos.value.filter(todo => !todo.completed && !todo.failed)
    );

    const completedTodos = computed(() =>
        todos.value.filter(todo => todo.completed)
    );

    const failedTodos = computed(() =>
        todos.value.filter(todo => todo.failed)
    );

    return {
        // State
        todos,
        isAddingTodo,
        newTodoText,
        editingId,
        editText,
        selectedDate,
        dailyAssessment,

        // Computed
        incompleteTodos,
        completedTodos,
        failedTodos,

        // Methods
        addTodo,
        editTodo,
        deleteTodo,
        toggleTodoStatus,
        fetchTodos,
        fetchAssessment,
        changeDate,
        saveDailyAssessment
    };
}