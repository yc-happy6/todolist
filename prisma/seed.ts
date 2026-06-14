import { PrismaClient } from '../src/generated/prisma-client/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({ url: 'file:./dev.db' })

const prisma = new PrismaClient({ adapter })

async function main() {
  const existing = await prisma.achievement.count()
  if (existing > 0) {
    console.log('Achievements already seeded')
    return
  }

  await prisma.achievement.createMany({
    data: [
      { name: '坚持新手', requiredDays: 3 },
      { name: '习惯养成者', requiredDays: 7 },
      { name: '高度自律', requiredDays: 30 },
      { name: '长期主义者', requiredDays: 100 },
    ],
  })

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
