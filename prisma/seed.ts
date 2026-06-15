import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashed = await bcrypt.hash('admin123', 12)

  await prisma.user.upsert({
    where: { userId: 'ONX000001' },
    update: {},
    create: {
      userId: 'ONX000001',
      name: 'Admin User',
      email: 'admin@onex.com',
      password: hashed,
      referralCode: 'ADMINREF1',
      role: 'admin',
      status: 'approved',
      walletBalance: 0,
      graphBalance: 0,
    },
  })

  await prisma.globalSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      taxEnabled: false,
      taxPercentage: 0,
      referralReward: 50,
      registrationBonus: 100,
    },
  })

  console.log('Seed complete. Admin: ONX000001 / admin123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
