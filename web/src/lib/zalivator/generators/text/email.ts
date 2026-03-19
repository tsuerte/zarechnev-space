import type { ZalivatorEmailOptions } from "@/lib/zalivator/options"
import { createRandomNameParts, transliterateCyrillic } from "@/lib/zalivator/generators/text/name"
import { pickRandom, randomInt } from "@/lib/zalivator/random"

const DEFAULT_EMAIL_DOMAINS = [
  "mail.ru",
  "bk.ru",
  "inbox.ru",
  "gmail.com",
  "yandex.ru",
] as const

const EMAIL_PATTERNS = [
  (firstName: string, lastName: string) => `${lastName}${randomInt(10, 999)}`,
  (firstName: string, lastName: string) => `${firstName}.${lastName}${randomInt(10, 99)}`,
  (firstName: string, lastName: string) => `${firstName}_${lastName}${randomInt(10, 99)}`,
  (firstName: string, lastName: string) => `${lastName}.${firstName}${randomInt(10, 99)}`,
] as const

export function generateEmail(options: ZalivatorEmailOptions) {
  const parts = createRandomNameParts("any")
  const transliteratedFirstName = transliterateCyrillic(parts.firstName)
  const transliteratedLastName = transliterateCyrillic(parts.lastName)
  const localPart = pickRandom([...EMAIL_PATTERNS])(
    transliteratedFirstName,
    transliteratedLastName
  )
  const domain = options.domain ?? pickRandom([...DEFAULT_EMAIL_DOMAINS])

  return `${localPart}@${domain}`
}
