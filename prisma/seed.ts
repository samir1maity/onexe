import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashed = await bcrypt.hash('admin123', 12)

  await prisma.user.upsert({
    where: { userId: 'ONXE000001' },
    update: {},
    create: {
      userId: 'ONXE000001',
      name: 'Admin User',
      email: 'admin@onexe.com',
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

  const userHashed = await bcrypt.hash('user123', 12)

  await prisma.user.upsert({
    where: { userId: 'ONXE000002' },
    update: {},
    create: {
      userId: 'ONXE000002',
      name: 'Test User',
      email: 'testuser@onexe.com',
      password: userHashed,
      referralCode: 'TESTREF01',
      role: 'user',
      status: 'approved',
      walletBalance: 500,
      graphBalance: 500,
    },
  })

  console.log('Seed complete.')
  console.log('Admin  → userId: ONXE000001 | email: admin@onexe.com    | password: admin123')
  console.log('User   → userId: ONXE000002 | email: testuser@onexe.com | password: user123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
