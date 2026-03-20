import { randomInt } from "@/lib/zalivator/random"

function padNumber(value: number, length: number) {
  return String(value).padStart(length, "0")
}

export function calculateSnilsCheckNumber(baseDigits: string) {
  const sum = baseDigits
    .split("")
    .reduce((total, digit, index) => total + Number(digit) * (9 - index), 0)

  if (sum < 100) {
    return padNumber(sum, 2)
  }

  if (sum === 100 || sum === 101) {
    return "00"
  }

  const remainder = sum % 101

  if (remainder === 100) {
    return "00"
  }

  return padNumber(remainder, 2)
}

export function generateSnils() {
  const baseDigits = padNumber(randomInt(1, 999_999_999), 9)
  const checkNumber = calculateSnilsCheckNumber(baseDigits)

  return `${baseDigits.slice(0, 3)}-${baseDigits.slice(3, 6)}-${baseDigits.slice(6, 9)} ${checkNumber}`
}
