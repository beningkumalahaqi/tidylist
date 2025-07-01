'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import Navigation from '../../components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { formatDuration } from '../../lib/utils'
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp 
} from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  const pieChartData = {
    labels: dashboardData?.weeklyStats?.map(stat => stat.kategori) || [],
    datasets: [
      {
        data: dashboardData?.weeklyStats?.map(stat => stat.waktu) || [],
        backgroundColor: dashboardData?.weeklyStats?.map(stat => stat.warna) || [],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  }

  const barChartData = {
    labels: dashboardData?.weeklyStats?.map(stat => stat.kategori) || [],
    datasets: [
      {
        label: 'Waktu (menit)',
        data: dashboardData?.weeklyStats?.map(stat => stat.waktu) || [],
        backgroundColor: dashboardData?.weeklyStats?.map(stat => stat.warna) || [],
        borderRadius: 4,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Selamat datang, {session.user?.name || session.user?.email}! 
              Berikut ringkasan aktivitas Anda.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tugas</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.totalTugas || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Semua tugas yang dibuat
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tugas Selesai</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{dashboardData?.tugasSelesai || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Tugas yang sudah diselesaikan
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tugas Pending</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{dashboardData?.tugasPending || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Tugas yang belum selesai
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Waktu Minggu Ini</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatDuration(dashboardData?.waktuTotal || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total waktu produktif
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          {dashboardData?.weeklyStats?.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Distribusi Waktu Minggu Ini</CardTitle>
                  <CardDescription>
                    Persentase waktu yang dihabiskan per kategori
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Doughnut data={pieChartData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Waktu per Kategori</CardTitle>
                  <CardDescription>
                    Total waktu dalam menit per kategori
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Bar data={barChartData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="mb-8">
              <CardContent className="py-12">
                <div className="text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Belum Ada Data Waktu
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Mulai menyelesaikan tugas untuk melihat visualisasi waktu Anda
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weekly Progress */}
          {dashboardData?.weeklyStats?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Progress Mingguan per Kategori</CardTitle>
                <CardDescription>
                  Rincian waktu dan persentase aktivitas Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.weeklyStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: stat.warna }}
                        ></div>
                        <span className="font-medium dark:text-gray-900">{stat.kategori}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          {formatDuration(stat.waktu)}
                        </span>
                        <span className="text-sm font-medium text-blue-600">
                          {stat.persentase}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
