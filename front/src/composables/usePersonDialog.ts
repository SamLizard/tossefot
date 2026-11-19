/**
 * Fiche de personne ouverte en modale (PersonDialog), partagée par toute la page :
 * puces des segments, glossaire, relations entre personnes.
 */
import { ref } from 'vue'

const openPersonId = ref<string | null>(null)

export function usePersonDialog() {
  function openPerson(id: string) {
    openPersonId.value = id
  }
  function closePerson() {
    openPersonId.value = null
  }
  return { openPersonId, openPerson, closePerson }
}
