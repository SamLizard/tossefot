/**
 * Vue courante de la page d'un תוספות : paramètre `view` de la route,
 * sinon la vue par défaut des préférences.
 */
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePreferences } from '@/composables/usePreferences'
import { isMainView, isPageView, type PageView } from '@/utils/views'

export function useViewNavigation() {
  const route = useRoute()
  const router = useRouter()
  const preferences = usePreferences()

  const currentView = computed<PageView>(() => {
    const param = route.params.view
    const view = typeof param === 'string' ? param : ''
    return isPageView(view) ? view : preferences.view
  })

  /**
   * Change de vue ; seule la vue « structure » garde la query (`open`).
   * `query` remplace la query (ex. `{ q }` pour préremplir la recherche du glossaire).
   */
  async function goTo(view: PageView, query?: Record<string, string>) {
    if (isMainView(view)) preferences.view = view
    if (!query && view === currentView.value && route.params.view === view) return
    await router.push({
      name: 'tosafot',
      params: { slug: route.params.slug, view },
      query: query ?? (view === 'structure' ? route.query : {}),
    })
  }

  return { currentView, goTo }
}
