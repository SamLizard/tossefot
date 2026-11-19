import type { PersonDates } from '@/types/tosafot'
import { t } from '@/i18n'

/** « 1040 – 1105 », « vers 1085 – 1158 » ; « ? » pour une borne manquante. Vide sans aucune date. */
export function formatPersonDates(dates: PersonDates | undefined): string {
  if (!dates || (dates.from === undefined && dates.to === undefined)) return ''
  const unknown = t('people.dateUnknown')
  const params = { from: dates.from ?? unknown, to: dates.to ?? unknown }
  return t(dates.approx ? 'people.datesApprox' : 'people.dates', params)
}
