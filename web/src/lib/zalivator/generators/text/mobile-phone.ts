import type { ZalivatorMobilePhoneOptions } from "@/lib/zalivator/options"
import { pickRandom, randomInt } from "@/lib/zalivator/random"

const MOBILE_PREFIXES = [
  "901",
  "903",
  "905",
  "906",
  "908",
  "909",
  "912",
  "916",
  "919",
  "926",
  "929",
  "950",
  "953",
  "960",
  "963",
  "966",
  "977",
  "981",
  "991",
] as const

export function generateMobilePhone(options: ZalivatorMobilePhoneOptions) {
  const prefix = pickRandom([...MOBILE_PREFIXES])
  const part1 = randomInt(100, 999)
  const part2 = randomInt(10, 99)
  const part3 = randomInt(10, 99)

  switch (options.format) {
    case "plain":
      return `+7${prefix}${part1}${part2}${part3}`
    case "spaced-hyphen":
      return `+7 ${prefix} ${part1}-${part2}-${part3}`
    case "spaced":
      return `+7 ${prefix} ${part1} ${part2} ${part3}`
    case "paren-hyphen":
    default:
      return `+7 (${prefix}) ${part1}-${part2}-${part3}`
  }
}
