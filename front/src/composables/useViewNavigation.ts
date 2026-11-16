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

  /** Change de vue ; seule la vue « structure » garde la query (`open`). */
  async function goTo(view: PageView) {
    if (isMainView(view)) preferences.view = view
    if (view === currentView.value && route.params.view === view) return
    await router.push({
      name: 'tosafot',
      params: { slug: route.params.slug, view },
      query: view === 'structure' ? route.query : {},
    })
  }

  return { currentView, goTo }
}
