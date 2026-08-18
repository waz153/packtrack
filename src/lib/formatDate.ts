export function formatEventDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleDateString(undefined, { timeZone: 'UTC' })
}
