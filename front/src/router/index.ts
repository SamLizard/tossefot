import { createRouter, createWebHashHistory } from 'vue-router'
import { catalog } from '@/data/catalog'

/**
 * Historique en hash (#/slug/vue) : fonctionne sans serveur et hors ligne (PWA).
 * L'état replié de l'arbre est en paramètre `open` (ex. #/slug/structure?open=I,II.A).
 */
export default createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      // Un seul תוספות pour l'instant : on l'ouvre directement.
      redirect: () =>
        catalog.length === 1 ? { name: 'tosafot', params: { slug: catalog[0]!.slug } } : { name: 'catalog' },
    },
    { path: '/catalog', name: 'catalog', component: () => import('@/pages/CatalogPage.vue') },
    {
      path: '/:slug/:view?',
      name: 'tosafot',
      component: () => import('@/pages/TosafotPage.vue'),
      props: true,
    },
  ],
})
