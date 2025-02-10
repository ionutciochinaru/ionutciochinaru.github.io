import { ref } from 'vue'
import { Weather } from './Weather.js'
import { TodoList } from './TodoList.js'
import { Navigation } from './Navigation.js'
import { Header } from './Header.js'

export const App = {
    components: {
        Weather,
        TodoList,
        Navigation,
        Header
    },

    template: `
        <div class="app">
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
        </div>
    `,

    setup() {
        const currentPage = ref(0)
        return { currentPage }
    }
}