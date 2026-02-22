const RU_MONTHS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
]

export function formatPublishedDate(value?: string): string {
  if (!value) return "No publish date"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "No publish date"

  const day = date.getUTCDate()
  const month = RU_MONTHS[date.getUTCMonth()]
  const year = date.getUTCFullYear()

  if (!month) return "No publish date"
  return `${day} ${month} ${year}`
}
