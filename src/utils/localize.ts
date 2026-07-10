import type { LocalizedText, Locale } from '@/types'

export function localize(text: LocalizedText, locale: Locale): string {
  return text[locale] ?? text.vi
}
