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
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [todayTasks, overdueTasks, upcomingTasks, recentCompletion] = await Promise.all([
      // Today's tasks
      prisma.tugas.findMany({
        where: {
          userId,
          createdAt: { gte: todayStart },
          status: { in: ['PENDING', 'IN_PROGRESS'] }
        }
      }),
      
      // Overdue tasks
      prisma.tugas.findMany({
        where: {
          userId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          deadline: { lt: now }
        }
      }),
      
      // Upcoming high priority tasks
      prisma.tugas.findMany({
        where: {
          userId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          prioritas: { in: ['HIGH', 'URGENT'] },
          deadline: { 
            gte: now,
            lte: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // next 3 days
          }
        }
      }),
      
      // Recent completion rate
      prisma.tugas.findMany({
        where: {
          userId,
          createdAt: { gte: weekStart }
        }
      })
    ])

    const suggestions = []
    
    // Context-aware suggestions based on current state
    if (overdueTasks.length > 0) {
      suggestions.push({
        type: 'warning',
        title: `${overdueTasks.length} tugas terlambat`,
        description: 'Perlu perhatian segera untuk mengejar keterlambatan',
        prompt: `Saya memiliki ${overdueTasks.length} tugas yang terlambat. Bagaimana cara mengejar keterlambatan ini?`
      })
    }
    
    if (todayTasks.length > 5) {
      suggestions.push({
        type: 'time',
        title: 'Banyak tugas hari ini',
        description: 'Optimalisasi jadwal untuk menyelesaikan semua tugas',
        prompt: `Saya memiliki ${todayTasks.length} tugas hari ini. Bagaimana cara mengelola waktu yang efektif?`
      })
    }
    
    if (upcomingTasks.length > 0) {
      suggestions.push({
        type: 'priority',
        title: `${upcomingTasks.length} tugas prioritas tinggi mendekat`,
        description: 'Persiapkan strategi untuk tugas-tugas penting',
        prompt: 'Bantu saya mempersiapkan strategi untuk tugas prioritas tinggi yang akan datang'
      })
    }
    
    const completedThisWeek = recentCompletion.filter(t => t.status === 'COMPLETED').length
    const completionRate = recentCompletion.length > 0 ? (completedThisWeek / recentCompletion.length) * 100 : 0
    
    if (completionRate < 50) {
      suggestions.push({
        type: 'productivity',
        title: 'Tingkatkan produktivitas',
        description: 'Tips untuk meningkatkan tingkat penyelesaian tugas',
        prompt: 'Produktivitas saya sedang menurun. Berikan tips untuk meningkatkannya'
      })
    }
    
    // If no specific issues, provide general productivity tips
    if (suggestions.length === 0) {
      suggestions.push({
        type: 'productivity',
        title: 'Tips produktivitas harian',
        description: 'Saran untuk memaksimalkan hari ini',
        prompt: 'Berikan tips produktivitas untuk mengoptimalkan hari ini'
      })
    }
    
    // Limit to 3 most relevant suggestions
    return NextResponse.json(suggestions.slice(0, 3))
  } catch (error) {
    console.error('Suggestions API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
