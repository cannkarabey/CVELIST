import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // index.js teki router'ı importlar

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

createApp(App).use(router).mount('#app')
