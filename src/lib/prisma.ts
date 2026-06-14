import { PrismaClient } from '@/generated/prisma-client/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function makePrismaClient() {
  const adapter = new PrismaLibSql({ url: 'file:./dev.db' })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? makePrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
