export function pickRandom<T>(values: T[]) {
  return values[Math.floor(Math.random() * values.length)]
}

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
