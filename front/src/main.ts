import { createApp } from 'vue'
import '@fontsource/noto-serif-hebrew/400.css'
import '@fontsource/noto-serif-hebrew/700.css'
import '@fontsource/noto-rashi-hebrew/400.css'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import './styles/main.css'

createApp(App).use(vuetify).use(router).mount('#app')
