// components/App.js
const { ref, computed } = Vue;
import { Weather } from './Weather.js';
import { TodoList } from './TodoList.js';
import { Navigation } from './Navigation.js';
import { Header } from './Header.js';
import { Login } from './login.js';
import { Loading } from './Loading.js';
import { Achievements } from './Achievements.js';
import { useAuth } from '../composables/useAuth.js';

export const App = {
    components: {
        Weather,
        TodoList,
        Navigation,
        Header,
        Login,
        Loading,
        Achievements
    },

    template: `
      <div class="app">
        <Loading v-if="loading" />
        <template v-else-if="user">
          <Header @logout="handleLogout" />
          <main class="main-content">
            <Weather v-if="currentPage === 0" />
            <TodoList v-if="currentPage === 1" />
            <Achievements v-if="currentPage === 2" />
          </main>
          <Navigation
              :current-page="currentPage"
              @page-change="currentPage = $event"
          />
          <div v-if="!isOnline" class="offline-indicator">
            Offline Mode
          </div>
        </template>
        <Login v-else />
      </div>
    `,

    setup() {
        const { user, loading, logout } = useAuth();
        const currentPage = ref(0);
        const isOnline = ref(navigator.onLine);

        // Watch online status
        window.addEventListener('online', () => {
            isOnline.value = true;
        });
        window.addEventListener('offline', () => {
            isOnline.value = false;
        });

        const handleLogout = async () => {
            currentPage.value = 0; // Reset to first page
            await logout();
        };

        return {
            currentPage,
            user,
            loading,
            isOnline,
            handleLogout
        };
    }
};