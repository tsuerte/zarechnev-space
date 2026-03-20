import type { ZalivatorInnKind, ZalivatorInnOptions } from "@/lib/zalivator/options"
import { randomInt } from "@/lib/zalivator/random"

function calculateCheckDigit(digits: number[], coefficients: number[]) {
  const sum = coefficients.reduce((total, coefficient, index) => {
    return total + digits[index] * coefficient
  }, 0)

  return (sum % 11) % 10
}

function createRandomDigits(length: number) {
  return Array.from({ length }, () => randomInt(0, 9))
}

export function calculateInnCheckDigits(kind: ZalivatorInnKind, baseDigits: string) {
  const digits = baseDigits.split("").map(Number)

  if (kind === "legal") {
    const control = calculateCheckDigit(digits, [2, 4, 10, 3, 5, 9, 4, 6, 8])
    return String(control)
  }

  const firstControl = calculateCheckDigit(digits, [7, 2, 4, 10, 3, 5, 9, 4, 6, 8])
  const secondControl = calculateCheckDigit(
    [...digits, firstControl],
    [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]
  )

  return `${firstControl}${secondControl}`
}

export function generateInn(options: ZalivatorInnOptions) {
  if (options.kind === "legal") {
    const baseDigits = createRandomDigits(9).join("")
    return `${baseDigits}${calculateInnCheckDigits("legal", baseDigits)}`
  }

  const baseDigits = createRandomDigits(10).join("")
  return `${baseDigits}${calculateInnCheckDigits("physical", baseDigits)}`
}
