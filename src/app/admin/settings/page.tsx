import { prisma } from '@/lib/prisma'
import AdminSettingsClient from '@/components/admin/AdminSettingsClient'

export default async function AdminSettingsPage() {
  let settings = await prisma.globalSettings.findFirst()
  if (!settings) {
    settings = await prisma.globalSettings.create({
      data: { taxEnabled: false, taxPercentage: 0, referralReward: 50, registrationBonus: 100 },
    })
  }
  return <AdminSettingsClient settings={JSON.parse(JSON.stringify(settings))} />
}
