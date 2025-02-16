// components/App.js
import { Weather } from "./Weather.js";
import { TodoList } from "./TodoList.js";
import { Navigation } from "./Navigation.js";
import { Header } from "./Header.js";
import { Login } from "./login.js";
import {useAuth} from "../composables/useAuth.js";

const { ref, computed } = Vue;

export const App = {
    components: {
        Weather,
        TodoList,
        Navigation,
        Header,
        Login
    },

    template: `
      <div class="app">
        <template v-if="user">
          <Header />
          <main class="main-content">
            <Weather v-if="currentPage === 0" />
            <TodoList v-if="currentPage === 1" />
            <div v-if="currentPage === 2" class="page">Stats Page</div>
          </main>
          <Navigation
              :current-page="currentPage"
              @page-change="currentPage = $event"
          />
        </template>
        <Login v-else />
      </div>
    `,

    setup() {
        const { user, loading } = useAuth();
        const currentPage = ref(0);

        return {
            currentPage,
            user,
            loading
        };
    }
};