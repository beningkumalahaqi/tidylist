import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    // Get current week stats
    const [currentWeekTasks, previousWeekTasks, overdueTasks, highPriorityTasks] = await Promise.all([
      prisma.tugas.findMany({
        where: {
          userId,
          createdAt: { gte: oneWeekAgo }
        },
        include: { riwayat: true }
      }),
      
      prisma.tugas.findMany({
        where: {
          userId,
          createdAt: { 
            gte: twoWeeksAgo,
            lt: oneWeekAgo
          }
        },
        include: { riwayat: true }
      }),
      
      prisma.tugas.findMany({
        where: {
          userId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          deadline: { lt: now }
        }
      }),
      
      prisma.tugas.findMany({
        where: {
          userId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          prioritas: { in: ['HIGH', 'URGENT'] }
        }
      })
    ])

    // Calculate completion rates
    const currentCompleted = currentWeekTasks.filter(t => t.status === 'COMPLETED').length
    const currentTotal = currentWeekTasks.length
    const currentCompletionRate = currentTotal > 0 ? Math.round((currentCompleted / currentTotal) * 100) : 0

    const previousCompleted = previousWeekTasks.filter(t => t.status === 'COMPLETED').length
    const previousTotal = previousWeekTasks.length
    const previousCompletionRate = previousTotal > 0 ? Math.round((previousCompleted / previousTotal) * 100) : 0

    const weeklyChange = currentCompletionRate - previousCompletionRate

    // Calculate average task time
    const completedWithTime = currentWeekTasks.filter(t => t.status === 'COMPLETED' && t.waktuSelesai)
    const avgTaskTime = completedWithTime.length > 0 
      ? Math.round(completedWithTime.reduce((sum, t) => sum + t.waktuSelesai, 0) / completedWithTime.length)
      : 0

    const previousCompletedWithTime = previousWeekTasks.filter(t => t.status === 'COMPLETED' && t.waktuSelesai)
    const previousAvgTaskTime = previousCompletedWithTime.length > 0
      ? Math.round(previousCompletedWithTime.reduce((sum, t) => sum + t.waktuSelesai, 0) / previousCompletedWithTime.length)
      : 0

    const timeChange = avgTaskTime - previousAvgTaskTime

    // Generate recommendations
    const recommendations = generateRecommendations({
      completionRate: currentCompletionRate,
      weeklyChange,
      overdueTasks: overdueTasks.length,
      highPriorityTasks: highPriorityTasks.length,
      avgTaskTime
    })

    const insights = {
      weeklyCompletionRate: currentCompletionRate,
      weeklyChange,
      avgTaskTime,
      timeChange,
      highPriorityTasks: highPriorityTasks.length,
      overdueTasks: overdueTasks.length,
      recommendations
    }

    return NextResponse.json(insights)
  } catch (error) {
    console.error('Insights API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateRecommendations({ completionRate, weeklyChange, overdueTasks, highPriorityTasks, avgTaskTime }) {
  const recommendations = []

  if (completionRate < 50) {
    recommendations.push('Fokus pada tugas dengan prioritas tinggi untuk meningkatkan produktivitas')
  } else if (completionRate > 80) {
    recommendations.push('Performa sangat baik! Pertimbangkan untuk menambah tantangan baru')
  }

  if (weeklyChange < -10) {
    recommendations.push('Produktivitas menurun minggu ini. Coba evaluasi beban kerja dan istirahat yang cukup')
  } else if (weeklyChange > 10) {
    recommendations.push('Produktivitas meningkat! Pertahankan momentum ini')
  }

  if (overdueTasks > 3) {
    recommendations.push('Banyak tugas terlambat. Pertimbangkan untuk mengatur ulang deadline yang lebih realistis')
  }

  if (highPriorityTasks > 5) {
    recommendations.push('Terlalu banyak tugas prioritas tinggi. Coba delegasikan atau pecah menjadi sub-tugas')
  }

  if (avgTaskTime > 120) {
    recommendations.push('Rata-rata waktu tugas cukup tinggi. Coba terapkan teknik time blocking')
  }

  if (recommendations.length === 0) {
    recommendations.push('Terus pertahankan konsistensi dalam mengelola tugas!')
  }

  return recommendations
}
