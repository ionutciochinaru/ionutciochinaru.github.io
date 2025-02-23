// services/firebaseService.js
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,  // Added this import
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    increment,
    serverTimestamp,
    arrayUnion  // Added this import
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { db, auth } from '../firebaseConfig.js';

export const firebaseService = {
    // User Profile
    async initializeUserProfile() {
        const userRef = doc(db, 'users', auth.currentUser.uid, 'profile');
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            await setDoc(userRef, {
                name: auth.currentUser.displayName,
                email: auth.currentUser.email,
                created_at: serverTimestamp(),
                settings: {
                    pomodoro_duration: 25,
                    short_break_duration: 5,
                    long_break_duration: 15,
                    pomodoros_until_long_break: 4
                }
            });
        }
    },

    // Todos
    async getTodosForDate(date) {
        const todosRef = collection(db, 'users', auth.currentUser.uid, 'days', date, 'todos');
        const q = query(todosRef, orderBy('created_at', 'asc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    },

    async addTodo(date, todoData) {
        const todosRef = collection(db, 'users', auth.currentUser.uid, 'days', date, 'todos');
        const todo = {
            ...todoData,
            created_at: serverTimestamp(),
            status: 'active',
            completed_at: null,
            failed_at: null,
            pomodoros_completed: 0,
            total_focus_time: 0
        };

        const docRef = await addDoc(todosRef, todo);
        return docRef.id;
    },

    async updateTodoStatus(date, todoId, status) {
        try {
            console.log('Updating todo status:', { date, todoId, status });

            // First ensure the day document exists
            const dayRef = doc(db, 'users', auth.currentUser.uid, 'days', date);
            const dayDoc = await getDoc(dayRef);

            if (!dayDoc.exists()) {
                await setDoc(dayRef, {
                    stats: {
                        completed_todos: 0,
                        failed_todos: 0,
                        total_pomodoros: 0,
                        total_focus_time: 0
                    }
                });
            }

            // Update the todo
            const todoRef = doc(db, `users/${auth.currentUser.uid}/days/${date}/todos/${todoId}`);
            const updates = {
                status,
                updated_at: serverTimestamp()
            };

            if (status === 'completed') {
                updates.completed_at = serverTimestamp();
                updates.failed_at = null;
            } else if (status === 'failed') {
                updates.failed_at = serverTimestamp();
                updates.completed_at = null;
            } else {
                // If reverting to active
                updates.completed_at = null;
                updates.failed_at = null;
            }

            await updateDoc(todoRef, updates);
            return true;
        } catch (error) {
            console.error('Error updating todo status:', error);
            throw error;
        }
    },

    // Edit todo
    async editTodo(date, todoId, text) {
        const todoRef = doc(db, 'users', auth.currentUser.uid, 'days', date, 'todos', todoId);
        await updateDoc(todoRef, { text });
    },

    // Delete todo
    async deleteTodo(date, todoId) {
        try {
            const todoRef = doc(db, `users/${auth.currentUser.uid}/days/${date}/todos/${todoId}`);
            await deleteDoc(todoRef);
            return true;
        } catch (error) {
            console.error('Error deleting todo:', error);
            throw error;
        }
    },

    // Focus Sessions
    async recordPomodoroSession(date, todoId, duration) {
        const todoRef = doc(db, 'users', auth.currentUser.uid, 'days', date, 'todos', todoId);
        await updateDoc(todoRef, {
            pomodoros_completed: increment(1),
            total_focus_time: increment(duration)
        });

        // Update daily stats
        const dayRef = doc(db, 'users', auth.currentUser.uid, 'days', date);
        await updateDoc(dayRef, {
            'stats.total_pomodoros': increment(1),
            'stats.total_focus_time': increment(duration)
        });

        // Update overall achievements
        const achievementsRef = doc(db, 'users', auth.currentUser.uid, 'achievements');
        await updateDoc(achievementsRef, {
            total_pomodoros: increment(1),
            total_focus_time: increment(duration)
        });
    },

    // Daily Assessment
    async saveDailyAssessment(date, assessment) {
        const dayRef = doc(db, 'users', auth.currentUser.uid, 'days', date);
        await updateDoc(dayRef, {
            assessment: {
                ...assessment,
                completed_at: serverTimestamp()
            }
        });
    },

    // Achievements
    async getAchievements() {
        const achievementsRef = doc(db, 'users', auth.currentUser.uid, 'achievements');
        const doc = await getDoc(achievementsRef);
        return doc.exists() ? doc.data() : null;
    },

    async unlockAchievement(achievement) {
        const achievementsRef = doc(db, 'users', auth.currentUser.uid, 'achievements');
        await updateDoc(achievementsRef, {
            unlocked: arrayUnion({
                ...achievement,
                unlocked_at: serverTimestamp()
            })
        });
    }
};