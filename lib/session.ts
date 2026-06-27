import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  if (!userId) return null
  const user = await prisma.user.findUnique({ where: { id: userId } })
  return user
}
