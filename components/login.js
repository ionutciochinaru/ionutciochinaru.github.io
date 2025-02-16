// components/Login.js
import {useAuth} from "../composables/useAuth.js";

const { ref } = Vue;

export const Login = {
    template: `
        <div class="login-container">
            <div class="login-box">
                <h1 class="login-title">Kindle Dashboard</h1>
                
                <form v-if="!loading" @submit.prevent="handleEmailLogin" class="login-form">
                    <div class="form-group">
                        <input
                            type="email"
                            v-model="email"
                            placeholder="Email"
                            required
                            class="login-input"
                        >
                    </div>
                    <div class="form-group">
                        <input
                            type="password"
                            v-model="password"
                            placeholder="Password"
                            required
                            class="login-input"
                        >
                    </div>
                    <div v-if="error" class="error-message">{{ error }}</div>
                    <button type="submit" class="login-button">Login</button>
                </form>

<!--                <div class="divider">or</div>-->

<!--                <button -->
<!--                    @click="handleGoogleLogin" -->
<!--                    class="google-button"-->
<!--                    :disabled="loading"-->
<!--                >-->
<!--                    Sign in with Google-->
<!--                </button>-->
            </div>
        </div>
    `,

    setup() {
        const { signInWithEmail, signInWithGoogle, error: authError, loading } = useAuth();
        const email = ref('');
        const password = ref('');
        const error = ref('');

        const handleEmailLogin = async () => {
            try {
                error.value = '';
                await signInWithEmail(email.value, password.value);
            } catch (err) {
                error.value = 'Invalid email or password';
            }
        };

        const handleGoogleLogin = async () => {
            try {
                error.value = '';
                await signInWithGoogle();
            } catch (err) {
                error.value = 'Could not sign in with Google';
            }
        };

        return {
            email,
            password,
            error,
            loading,
            handleEmailLogin,
            handleGoogleLogin
        };
    }
};