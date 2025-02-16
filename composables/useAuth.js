// composables/useAuth.js
const { ref, onMounted, onUnmounted } = Vue;
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { auth } from '../firebaseConfig.js';

export function useAuth() {
    const user = ref(null);
    const error = ref(null);
    const loading = ref(true);
    const unsubscribe = ref(null);

    // Initialize auth state observer
    onMounted(() => {
        unsubscribe.value = onAuthStateChanged(auth, (currentUser) => {
            user.value = currentUser;
            loading.value = false;
        }, (err) => {
            error.value = err;
            loading.value = false;
        });
    });

    // Clean up auth observer
    onUnmounted(() => {
        if (unsubscribe.value) unsubscribe.value();
    });

    // Sign in with email/password
    const signInWithEmail = async (email, password) => {
        try {
            loading.value = true;
            error.value = null;
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            user.value = userCredential.user;
            return userCredential.user;
        } catch (err) {
            error.value = err.message;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Sign in with Google
    const signInWithGoogle = async () => {
        try {
            loading.value = true;
            error.value = null;
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            user.value = userCredential.user;
            return userCredential.user;
        } catch (err) {
            error.value = err.message;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Sign out
    const logout = async () => {
        try {
            await signOut(auth);
            user.value = null;
        } catch (err) {
            error.value = err.message;
            throw err;
        }
    };

    return {
        user,
        error,
        loading,
        signInWithEmail,
        signInWithGoogle,
        logout
    };
}