import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { installPlugins } from './plugins';

const app = createApp(App);
app.mount('#app');
installPlugins(app);
