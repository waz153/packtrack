import 'dotenv/config'
import { readFileSync } from 'fs'
import { join } from 'path'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import { generateQrToken, generatePasscode } from '../src/lib/token'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const DEN_NAMES = ['Tiger', 'Wolf', 'Bear', 'Webelos', 'AOL'] as const

function parseRosterCsv(csvPath: string) {
  const raw = readFileSync(csvPath, 'utf-8').trim()
  const lines = raw.split(/\r?\n/)
  const [header, ...rows] = lines
  const cols = header.split(',').map((c) => c.trim().toLowerCase())
  const firstIdx = cols.indexOf('first name')
  const lastIdx = cols.indexOf('last name')
  const denIdx = cols.indexOf('den')

  return rows
    .filter((r) => r.trim().length > 0)
    .map((row) => {
      const parts = row.split(',')
      return {
        firstName: parts[firstIdx]?.trim() ?? '',
        lastName: parts[lastIdx]?.trim() ?? '',
        den: parts[denIdx]?.trim() ?? '',
      }
    })
}

async function main() {
  console.log('Seeding dens...')
  const dens = new Map<string, string>()
  for (const name of DEN_NAMES) {
    const den = await prisma.den.upsert({
      where: { name },
      update: {},
      create: { name, logoUrl: null },
    })
    dens.set(name, den.id)
  }

  console.log('Importing roster...')
  const existingScoutCount = await prisma.scout.count()
  let imported = 0
  const skipped: { firstName: string; lastName: string; den: string }[] = []

  if (existingScoutCount > 0) {
    console.log(`Scouts table already has ${existingScoutCount} records — skipping roster import.`)
  } else {
    const rosterPath = join(__dirname, '..', 'seed-data', 'roster.csv')
    const rows = parseRosterCsv(rosterPath)

    for (const row of rows) {
      const denId = dens.get(row.den)
      if (!denId || !row.firstName || !row.lastName) {
        skipped.push(row)
        continue
      }
      await prisma.scout.create({
        data: {
          firstName: row.firstName,
          lastName: row.lastName,
          denId,
        },
      })
      imported++
    }
  }

  console.log(`Imported ${imported} scouts.`)
  if (skipped.length > 0) {
    console.log(`Skipped ${skipped.length} rows (unrecognized den or missing name):`)
    for (const s of skipped) console.log(`  - ${s.firstName} ${s.lastName} (${s.den || 'blank'})`)
  }

  console.log('Creating 8/23 Pack Meeting event...')
  const EVENT_ID = 'seed-pack-meeting-2026-08-23'
  let event = await prisma.event.findUnique({ where: { id: EVENT_ID } })
  if (!event) {
    event = await prisma.event.create({
      data: {
        id: EVENT_ID,
        name: 'Pack Meeting — New Family Orientation',
        date: new Date('2026-08-23T16:00:00-07:00'),
        startTime: '4:00 PM',
        endTime: '5:00 PM',
        location: 'Greenbrook Redwoods',
        notes: 'New Family Orientation during meeting',
        status: 'UNLOCKED',
        isManualOverride: true,
        qrToken: generateQrToken(),
      },
    })
    console.log(`Event created: ${event.name} — qrToken: ${event.qrToken}`)
  } else {
    console.log(`Event already exists: ${event.name} — qrToken: ${event.qrToken}`)
  }

  console.log('Creating admin account...')
  const ADMIN_ID = 'seed-admin-waseem'
  let admin = await prisma.person.findUnique({ where: { id: ADMIN_ID } })
  let adminPasscode: string
  if (!admin) {
    adminPasscode = generatePasscode(4)
    admin = await prisma.person.create({
      data: {
        id: ADMIN_ID,
        name: 'Waseem',
        passcode: adminPasscode,
        role: 'ADMIN',
        active: true,
      },
    })
  } else {
    adminPasscode = admin.passcode
    console.log('Admin account already exists — passcode unchanged.')
  }

  console.log('')
  console.log('=== SEED SUMMARY ===')
  console.log(`Scouts imported: ${imported}`)
  console.log(`Event QR token: ${event.qrToken}`)
  console.log(`Check-in URL: /checkin/${event.qrToken}`)
  console.log(`Admin login: name="${admin.name}", passcode="${adminPasscode}"`)
  console.log('====================')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
