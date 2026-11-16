import { createApp } from 'vue'
import '@fontsource/noto-serif-hebrew/400.css'
import '@fontsource/noto-serif-hebrew/700.css'
import '@fontsource/noto-rashi-hebrew/400.css'
import App from './App.vue'
import i18n from './i18n'
import vuetify from './plugins/vuetify'
import router from './router'
import './styles/main.css'

document.title = i18n.global.t('app.title')

// i18n avant Vuetify : l'adaptateur de Vuetify utilise l'instance vue-i18n.
createApp(App).use(i18n).use(vuetify).use(router).mount('#app')
