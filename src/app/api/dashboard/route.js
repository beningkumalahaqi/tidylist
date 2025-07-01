import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get week dates
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    startOfWeek.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    // Get total tasks
    const totalTugas = await prisma.tugas.count({
      where: { userId }
    })

    // Get completed tasks
    const tugasSelesai = await prisma.tugas.count({
      where: {
        userId,
        status: 'COMPLETED'
      }
    })

    // Get pending tasks
    const tugasPending = await prisma.tugas.count({
      where: {
        userId,
        status: { in: ['PENDING', 'IN_PROGRESS'] }
      }
    })

    // Get total time spent this week
    const completedTasksThisWeek = await prisma.tugas.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: {
          gte: startOfWeek,
          lte: endOfWeek
        }
      },
      include: {
        kategori: true
      }
    })

    const waktuTotal = completedTasksThisWeek.reduce((total, task) => {
      return total + (task.waktuSelesai || task.estimasiWaktu || 0)
    }, 0)

    // Calculate weekly stats by category
    const categoryStats = {}
    completedTasksThisWeek.forEach(task => {
      const kategoriNama = task.kategori.nama
      const waktu = task.waktuSelesai || task.estimasiWaktu || 0
      
      if (!categoryStats[kategoriNama]) {
        categoryStats[kategoriNama] = {
          kategori: kategoriNama,
          waktu: 0,
          warna: task.kategori.warna,
          persentase: 0
        }
      }
      categoryStats[kategoriNama].waktu += waktu
    })

    // Calculate percentages
    const weeklyStats = Object.values(categoryStats).map(stat => ({
      ...stat,
      persentase: waktuTotal > 0 ? Math.round((stat.waktu / waktuTotal) * 100) : 0
    }))

    return NextResponse.json({
      totalTugas,
      tugasSelesai,
      tugasPending,
      waktuTotal,
      weeklyStats
    })

  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data dashboard' },
      { status: 500 }
    )
  }
}
