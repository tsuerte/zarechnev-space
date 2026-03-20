import { pickRandom, randomInt } from "@/lib/zalivator/random"

const REGISTRATION_REASONS = [
  "01",
  "43",
  "45",
  "50",
  "51",
  "52",
  "99",
] as const

function padNumber(value: number, length: number) {
  return String(value).padStart(length, "0")
}

export function generateKpp() {
  const taxOfficeCode = padNumber(randomInt(1000, 9999), 4)
  const registrationReason = pickRandom([...REGISTRATION_REASONS])
  const sequence = padNumber(randomInt(1, 999), 3)

  return `${taxOfficeCode}${registrationReason}${sequence}`
}
