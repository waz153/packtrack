import { randomBytes, randomInt } from 'crypto'

export function generateQrToken(): string {
  return randomBytes(16).toString('base64url')
}

export function generatePasscode(digits = 4): string {
  const max = 10 ** digits
  return randomInt(0, max).toString().padStart(digits, '0')
}
