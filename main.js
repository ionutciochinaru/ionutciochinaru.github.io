// main.js
const { createApp } = Vue;
import { App } from "./components/App.js";
import { app as firebaseApp } from './firebaseConfig.js';

const app = createApp(App);
app.mount('#app');