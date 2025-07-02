import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '@/lib/prisma'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, type = 'chat' } = await request.json()

    // Only require message for chat type
    if (!message && type === 'chat') {
      return NextResponse.json({ error: 'Message is required for chat' }, { status: 400 })
    }

    // Get user's task data for context
    const userData = await getUserTaskData(session.user.id)
    
    // Generate response based on type
    let response
    switch (type) {
      case 'weekly-insight':
        response = await generateWeeklyInsight(userData)
        break
      case 'schedule-suggestion':
        response = await generateScheduleSuggestion(userData)
        break
      case 'balance-analysis':
        response = await generateBalanceAnalysis(userData)
        break
      case 'productivity-tips':
        response = await generateProductivityTips(userData, message)
        break
      case 'smart-priority':
        response = await generateSmartPriority(userData)
        break
      case 'time-prediction':
        response = await generateTimePrediction(userData)
        break
      case 'burnout-detection':
        response = await generateBurnoutDetection(userData)
        break
      case 'energy-optimization':
        response = await generateEnergyOptimization(userData)
        break
      case 'habit-formation':
        response = await generateHabitFormation(userData)
        break
      default:
        response = await generateChatResponse(userData, message)
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error('TidyBot API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getUserTaskData(userId) {
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    recentTasks,
    completedTasks,
    categories,
    overdueTasks,
    weeklyStats
  ] = await Promise.all([
    // Recent tasks (last 7 days)
    prisma.tugas.findMany({
      where: {
        userId,
        createdAt: { gte: oneWeekAgo }
      },
      include: { kategori: true }
    }),
    
    // Completed tasks (last 30 days)
    prisma.tugas.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: { gte: oneMonthAgo }
      },
      include: { kategori: true, riwayat: true }
    }),
    
    // All categories
    prisma.kategori.findMany({
      where: { userId }
    }),
    
    // Overdue tasks
    prisma.tugas.findMany({
      where: {
        userId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        deadline: { lt: now }
      },
      include: { kategori: true }
    }),
    
    // Weekly completion stats
    prisma.tugas.groupBy({
      by: ['status'],
      where: {
        userId,
        createdAt: { gte: oneWeekAgo }
      },
      _count: { status: true }
    })
  ])

  return {
    recentTasks,
    completedTasks,
    categories,
    overdueTasks,
    weeklyStats,
    totalTasks: recentTasks.length,
    completionRate: weeklyStats.find(s => s.status === 'COMPLETED')?._count?.status || 0
  }
}

async function generateWeeklyInsight(userData) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  
  const prompt = `
Sebagai TidyBot, AI assistant untuk produktivitas, berikan insight mingguan berdasarkan data berikut:

Data Tugas Minggu Ini:
- Total tugas: ${userData.totalTasks}
- Tugas selesai: ${userData.completionRate}
- Tugas terlambat: ${userData.overdueTasks.length}
- Kategori tugas: ${userData.categories.map(c => c.nama).join(', ')}

Tugas yang diselesaikan:
${userData.completedTasks.slice(0, 5).map(task => 
  `- ${task.judul} (${task.kategori.nama}) - ${task.waktuSelesai || 'N/A'} menit`
).join('\n')}

Berikan insight yang mencakup:
1. Performa minggu ini
2. Pola produktivitas
3. Area yang perlu diperbaiki
4. Rekomendasi untuk minggu depan

Gunakan bahasa Indonesia yang ramah dan motivasi.
`

  const result = await model.generateContent(prompt)
  return result.response.text()
}

async function generateScheduleSuggestion(userData) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  
  const pendingTasks = userData.recentTasks.filter(task => 
    task.status === 'PENDING' || task.status === 'IN_PROGRESS'
  )
  
  const prompt = `
Sebagai TidyBot, berikan saran penjadwalan untuk tugas-tugas berikut:

Tugas yang perlu dijadwalkan:
${pendingTasks.map(task => 
  `- ${task.judul} (${task.kategori.nama}) - Prioritas: ${task.prioritas} - Estimasi: ${task.estimasiWaktu || 'Tidak ada'} menit - Deadline: ${task.deadline ? new Date(task.deadline).toLocaleDateString('id-ID') : 'Tidak ada'}`
).join('\n')}

Berikan saran penjadwalan yang optimal dengan mempertimbangkan:
1. Prioritas tugas
2. Deadline
3. Estimasi waktu
4. Keseimbangan beban kerja

Format dalam jadwal harian yang praktis. Gunakan bahasa Indonesia.
`

  const result = await model.generateContent(prompt)
  return result.response.text()
}

async function generateBalanceAnalysis(userData) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  
  const categoryStats = {}
  userData.completedTasks.forEach(task => {
    const categoryName = task.kategori.nama
    if (!categoryStats[categoryName]) {
      categoryStats[categoryName] = { count: 0, totalTime: 0 }
    }
    categoryStats[categoryName].count++
    categoryStats[categoryName].totalTime += task.waktuSelesai || 0
  })
  
  const prompt = `
Sebagai TidyBot, analisis keseimbangan waktu berdasarkan data berikut:

Distribusi waktu per kategori (30 hari terakhir):
${Object.entries(categoryStats).map(([category, stats]) => 
  `- ${category}: ${stats.count} tugas, ${stats.totalTime} menit total`
).join('\n')}

Berikan analisis tentang:
1. Apakah ada ketidakseimbangan dalam alokasi waktu
2. Kategori mana yang mendominasi
3. Saran untuk menciptakan keseimbangan yang lebih baik
4. Rekomendasi time blocking

Gunakan bahasa Indonesia dan berikan saran praktis.
`

  const result = await model.generateContent(prompt)
  return result.response.text()
}

async function generateProductivityTips(userData, userMessage) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  
  const prompt = `
Sebagai TidyBot, AI assistant produktivitas, berikan tips berdasarkan pertanyaan: "${userMessage}"

Konteks pengguna:
- Total tugas minggu ini: ${userData.totalTasks}
- Tingkat penyelesaian: ${userData.completionRate}/${userData.totalTasks}
- Tugas terlambat: ${userData.overdueTasks.length}
- Kategori yang ada: ${userData.categories.map(c => c.nama).join(', ')}

Berikan tips yang spesifik, praktis, dan dapat diterapkan langsung. Gunakan bahasa Indonesia yang ramah.
`

  const result = await model.generateContent(prompt)
  return result.response.text()
}

async function generateChatResponse(userData, message) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  
  const prompt = `
Kamu adalah TidyBot, AI assistant untuk aplikasi manajemen tugas TidyList. Jawab pertanyaan berikut dengan ramah dan membantu: "${message}"

Konteks data pengguna:
- Total tugas minggu ini: ${userData.totalTasks}
- Tugas selesai: ${userData.completionRate}
- Tugas terlambat: ${userData.overdueTasks.length}
- Kategori: ${userData.categories.map(c => c.nama).join(', ')}

Tugas yang belum selesai:
${userData.recentTasks.filter(t => t.status !== 'COMPLETED').slice(0, 3).map(task => 
  `- ${task.judul} (${task.kategori.nama})`
).join('\n')}

Berikan jawaban yang relevan dengan konteks produktivitas dan manajemen tugas. Gunakan bahasa Indonesia.
`

  const result = await model.generateContent(prompt)
  return result.response.text()
}

async function generateSmartPriority(userData) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  
  const pendingTasks = userData.recentTasks.filter(task => 
    task.status === 'PENDING' || task.status === 'IN_PROGRESS'
  )
  
  const prompt = `
Sebagai TidyBot dengan kemampuan analisis prioritas cerdas, analisis tugas-tugas berikut dan berikan prioritas yang optimal:

Tugas yang perlu diprioritaskan:
${pendingTasks.map(task => 
  `- ${task.judul} (${task.kategori.nama})
    - Prioritas saat ini: ${task.prioritas}
    - Deadline: ${task.deadline ? new Date(task.deadline).toLocaleDateString('id-ID') : 'Tidak ada'}
    - Estimasi waktu: ${task.estimasiWaktu || 'Tidak diketahui'} menit
    - Dibuat: ${new Date(task.createdAt).toLocaleDateString('id-ID')}`
).join('\n\n')}

Berikan analisis prioritas cerdas dengan mempertimbangkan:
1. Urgensi (deadline mendekat)
2. Dampak terhadap tujuan keseluruhan
3. Kompleksitas dan waktu yang dibutuhkan
4. Ketergantungan dengan tugas lain
5. Konsekuensi jika tidak diselesaikan

Format output dengan daftar prioritas yang direkomendasikan dan alasan untuk setiap perubahan prioritas.
`

  const result = await model.generateContent(prompt)
  return result.response.text()
}

async function generateTimePrediction(userData) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  
  const completedTasks = userData.completedTasks.filter(t => t.waktuSelesai)
  const pendingTasks = userData.recentTasks.filter(task => 
    task.status === 'PENDING' || task.status === 'IN_PROGRESS'
  )
  
  const prompt = `
Sebagai TidyBot dengan kemampuan prediksi waktu, analisis pola pengerjaan tugas dan berikan prediksi waktu yang akurat:

Riwayat tugas yang telah diselesaikan:
${completedTasks.slice(0, 10).map(task => 
  `- ${task.judul} (${task.kategori.nama}): ${task.waktuSelesai} menit (estimasi: ${task.estimasiWaktu || 'N/A'} menit)`
).join('\n')}

Tugas yang perlu diprediksi:
${pendingTasks.map(task => 
  `- ${task.judul} (${task.kategori.nama}) - Estimasi saat ini: ${task.estimasiWaktu || 'Belum ada'} menit`
).join('\n')}

Berikan prediksi waktu yang realistis berdasarkan:
1. Pola riwayat pengerjaan tugas serupa
2. Kompleksitas tugas
3. Kategori tugas
4. Kecenderungan overestimate/underestimate pengguna

Sertakan tingkat kepercayaan prediksi dan tips untuk meningkatkan akurasi estimasi waktu.
`

  const result = await model.generateContent(prompt)
  return result.response.text()
}

async function generateBurnoutDetection(userData) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  
  const totalWorkTime = userData.completedTasks.reduce((sum, task) => sum + (task.waktuSelesai || 0), 0)
  const averageCompletionTime = totalWorkTime / Math.max(userData.completedTasks.length, 1)
  
  const prompt = `
Sebagai TidyBot dengan kemampuan deteksi burnout, analisis pola kerja dan berikan assessment kesehatan mental produktivitas:

Data aktivitas (30 hari terakhir):
- Total tugas diselesaikan: ${userData.completedTasks.length}
- Total waktu kerja: ${Math.round(totalWorkTime / 60)} jam
- Rata-rata waktu per tugas: ${Math.round(averageCompletionTime)} menit
- Tugas terlambat: ${userData.overdueTasks.length}
- Tingkat penyelesaian: ${userData.completionRate}/${userData.totalTasks}

Distribusi kategori tugas:
${userData.categories.map(cat => {
  const categoryTasks = userData.completedTasks.filter(t => t.kategori.nama === cat.nama)
  return `- ${cat.nama}: ${categoryTasks.length} tugas`
}).join('\n')}

Analisis dan berikan:
1. Level risiko burnout (Rendah/Sedang/Tinggi)
2. Indikator yang menunjukkan tanda-tanda kelelahan
3. Rekomendasi untuk menjaga keseimbangan
4. Saran penjadwalan yang lebih sehat
5. Tips pemulihan jika diperlukan

Gunakan pendekatan yang empatis dan suportif.
`

  const result = await model.generateContent(prompt)
  return result.response.text()
}

async function generateEnergyOptimization(userData) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  
  const tasksByHour = {}
  userData.completedTasks.forEach(task => {
    if (task.riwayat) {
      const hour = new Date(task.riwayat.waktuMulai).getHours()
      if (!tasksByHour[hour]) tasksByHour[hour] = []
      tasksByHour[hour].push(task)
    }
  })
  
  const prompt = `
Sebagai TidyBot dengan kemampuan optimasi energi, analisis pola produktivitas dan berikan rekomendasi penjadwalan berdasarkan ritme alami:

Pola penyelesaian tugas berdasarkan waktu:
${Object.entries(tasksByHour).map(([hour, tasks]) => 
  `- Jam ${hour}:00: ${tasks.length} tugas (rata-rata ${Math.round(tasks.reduce((sum, t) => sum + (t.waktuSelesai || 0), 0) / tasks.length)} menit)`
).join('\n')}

Kategori tugas yang sering dikerjakan:
${userData.categories.map(cat => {
  const categoryTasks = userData.completedTasks.filter(t => t.kategori.nama === cat.nama)
  const avgTime = categoryTasks.reduce((sum, t) => sum + (t.waktuSelesai || 0), 0) / Math.max(categoryTasks.length, 1)
  return `- ${cat.nama}: ${categoryTasks.length} tugas, rata-rata ${Math.round(avgTime)} menit`
}).join('\n')}

Berikan rekomendasi optimasi energi:
1. Identifikasi jam-jam produktivitas tinggi
2. Saran penempatan tugas berdasarkan kompleksitas
3. Waktu optimal untuk istirahat
4. Strategi energy management harian
5. Tips memaksimalkan performa di waktu peak

Sertakan jadwal harian yang optimal berdasarkan analisis ini.
`

  const result = await model.generateContent(prompt)
  return result.response.text()
}

async function generateHabitFormation(userData) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  
  const consistencyData = {}
  userData.completedTasks.forEach(task => {
    const day = new Date(task.completedAt).toLocaleDateString('id-ID', { weekday: 'long' })
    if (!consistencyData[day]) consistencyData[day] = 0
    consistencyData[day]++
  })
  
  const prompt = `
Sebagai TidyBot dengan kemampuan pembentukan kebiasaan, analisis pola konsistensi dan berikan panduan pembentukan kebiasaan produktif:

Pola konsistensi harian:
${Object.entries(consistencyData).map(([day, count]) => 
  `- ${day}: ${count} tugas diselesaikan`
).join('\n')}

Analisis tugas berdasarkan kategori:
${userData.categories.map(cat => {
  const categoryTasks = userData.completedTasks.filter(t => t.kategori.nama === cat.nama)
  const frequency = categoryTasks.length / 30 // per hari dalam 30 hari
  return `- ${cat.nama}: ${categoryTasks.length} tugas (${frequency.toFixed(1)} tugas/hari)`
}).join('\n')}

Tingkat penyelesaian: ${userData.completionRate}/${userData.totalTasks}

Berikan panduan pembentukan kebiasaan:
1. Identifikasi kebiasaan produktif yang sudah terbentuk
2. Area yang perlu diperkuat konsistensinya
3. Strategi habit stacking untuk kebiasaan baru
4. Milestone dan reward system
5. Tips mempertahankan motivasi jangka panjang
6. Saran rutinitas harian/mingguan yang optimal

Fokus pada pembentukan kebiasaan yang berkelanjutan dan realistis.
`

  const result = await model.generateContent(prompt)
  return result.response.text()
}
