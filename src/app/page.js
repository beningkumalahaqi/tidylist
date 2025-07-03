'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { formatDuration } from '../lib/utils'
import { 
  CheckCircle, 
  Clock, 
  Target, 
  BarChart3, 
  Users, 
  Zap,
  ArrowRight,
  Play
} from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [quickStats, setQuickStats] = useState({
    todayTasks: 0,
    completedToday: 0,
    todayProductiveTime: 0,
    loading: true
  })

  // Fetch quick stats for logged in users
  useEffect(() => {
    if (session?.user?.id) {
      fetchQuickStats()
    }
  }, [session])

  const fetchQuickStats = async () => {
    try {
      setQuickStats(prev => ({ ...prev, loading: true }))
      
      // Get today's date range
      const today = new Date()
      const startOfDay = new Date(today.setHours(0, 0, 0, 0))
      const endOfDay = new Date(today.setHours(23, 59, 59, 999))
      
      // Fetch dashboard data
      const dashboardResponse = await fetch('/api/dashboard')
      const dashboardData = await dashboardResponse.json()
      
      // Fetch today's tasks
      const tasksResponse = await fetch('/api/tugas')
      const allTasks = await tasksResponse.json()
      
      // Filter tasks for today
      const todayTasks = allTasks.filter(task => {
        const taskDate = new Date(task.createdAt)
        return taskDate >= startOfDay && taskDate <= endOfDay
      })
      
      const completedToday = allTasks.filter(task => {
        if (task.status !== 'COMPLETED' || !task.completedAt) return false
        const completedDate = new Date(task.completedAt)
        return completedDate >= startOfDay && completedDate <= endOfDay
      })
      
      // Calculate today's productive time
      const todayProductiveTime = completedToday.reduce((total, task) => {
        return total + (task.waktuSelesai || task.estimasiWaktu || 0)
      }, 0)
      
      setQuickStats({
        todayTasks: todayTasks.length,
        completedToday: completedToday.length,
        todayProductiveTime,
        loading: false
      })
      
    } catch (error) {
      console.error('Error fetching quick stats:', error)
      setQuickStats(prev => ({ ...prev, loading: false }))
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4 relative">
            {/* Mobile: Centered logo, Desktop: Left-aligned logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2 sm:relative sm:left-auto sm:transform-none sm:flex-initial">
              <Link href="/" className="text-xl sm:text-2xl font-bold text-black hover:text-blue-700">
                🧹 TidyList
              </Link>
            </div>
            
            {/* Right side buttons */}
            <div className="flex items-center space-x-2 sm:space-x-4 ml-auto">
              {session ? (
                <>
                  <span className="hidden sm:block text-sm text-gray-600">
                    {session.user?.name || session.user?.email}
                  </span>
                  <Button
                    onClick={() => router.push('/dashboard')}
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex text-xs sm:text-sm"
                  >
                    Dashboard
                  </Button>
                  <Button
                    onClick={() => signOut()}
                    variant="ghost"
                    size="sm"
                    className="text-xs sm:text-sm"
                  >
                    Keluar
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => signIn()}
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm"
                  >
                    Masuk
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1">{session ? (
        // Logged in user view
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Selamat datang kembali, {session.user?.name || 'Pengguna'}!
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 px-2">
              Siap untuk menyelesaikan tugas-tugas hari ini?
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 px-4">
              <Button
                onClick={() => router.push('/dashboard')}
                className="flex items-center justify-center space-x-2"
                size="lg"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="hidden sm:inline">Lihat Dashboard</span>
              </Button>
              <Button
                onClick={() => router.push('/tugas')}
                variant="outline"
                className="flex items-center justify-center space-x-2"
                size="lg"
              >
                <CheckCircle className="w-5 h-5" />
                <span className="hidden sm:inline">Kelola Tugas</span>
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12 px-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tugas Hari Ini</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {quickStats.loading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    quickStats.completedToday
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {quickStats.loading ? 'Memuat...' : 'Tugas selesai hari ini'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Waktu Produktif</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {quickStats.loading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                  ) : (
                    formatDuration(quickStats.todayProductiveTime)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {quickStats.loading ? 'Memuat...' : 'Total hari ini'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        // Non-logged in user view
        <>
          {/* Hero Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-2">
                Kelola Waktu dan Tugas dengan{' '}
                <span className="text-blue-600">TidyList</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
                Aplikasi to-do list minimalis dengan pelacakan waktu yang membantu Anda 
                tetap produktif dan mencapai tujuan dengan lebih efisien.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 px-4">
                <Button
                  onClick={() => router.push('/login')}
                  className="flex items-center justify-center space-x-2"
                  size="lg"
                >
                  <Play className="w-5 h-5" />
                  <span>Mulai Gratis</span>
                </Button>
                <Button
                  onClick={() => signIn()}
                  variant="outline"
                  className="flex items-center justify-center space-x-2"
                  size="lg"
                >
                  <span>Masuk</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 bg-white">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Fitur Unggulan
              </h2>
              <p className="text-base sm:text-lg text-gray-600 px-4">
                Semua yang Anda butuhkan untuk manajemen tugas yang efektif
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>Manajemen Tugas</CardTitle>
                  <CardDescription>
                    Buat, edit, dan kelola tugas dengan mudah. Kategorikan berdasarkan prioritas dan deadline.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle>Pelacakan Waktu</CardTitle>
                  <CardDescription>
                    Lacak waktu yang dihabiskan untuk setiap tugas dan analisis produktivitas Anda.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle>Dashboard Analitik</CardTitle>
                  <CardDescription>
                    Visualisasi progress dan statistik produktivitas dengan grafik yang mudah dipahami.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle>Kategori Tugas</CardTitle>
                  <CardDescription>
                    Organisir tugas berdasarkan kategori untuk manajemen yang lebih terstruktur.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-indigo-600" />
                  </div>
                  <CardTitle>TidyBot AI</CardTitle>
                  <CardDescription>
                    Asisten AI yang memberikan saran dan insight untuk meningkatkan produktivitas.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-red-600" />
                  </div>
                  <CardTitle>Riwayat Aktivitas</CardTitle>
                  <CardDescription>
                    Lihat riwayat lengkap aktivitas dan progress untuk evaluasi diri.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-blue-600 text-white py-12 sm:py-20">
            <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Siap untuk Menjadi Lebih Produktif?
              </h2>
              <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-blue-100">
                Bergabunglah dengan ribuan pengguna yang telah meningkatkan produktivitas mereka dengan TidyList.
              </p>
              <Button
                onClick={() => router.push('/login')}
                className="bg-white text-blue-600 hover:bg-gray-100"
                size="lg"
              >
                Mulai Sekarang - Gratis!
              </Button>
            </div>
          </div>
        </>
      )}</div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">TidyList</h3>
            <p className="text-sm sm:text-base text-gray-400 mb-2 sm:mb-4">
              Minimalist Time-Tracking To-Do Application
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              © 2025 TidyList. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
