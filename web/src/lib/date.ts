export function formatPublishedDate(value?: string): string {
  if (!value) return 'No publish date'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'No publish date'

  const parts = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).formatToParts(date)

  const day = parts.find((part) => part.type === 'day')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const year = parts.find((part) => part.type === 'year')?.value

  if (!day || !month || !year) return 'No publish date'
  return `${day} ${month} ${year}`
}
