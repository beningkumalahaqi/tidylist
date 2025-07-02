'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navigation from '../../components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { formatDuration, formatDate } from '../../lib/utils'
import { 
  History, 
  CheckCircle, 
  Clock, 
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

export default function HistoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    fetchHistory()
  }, [session, status, router, pagination.page])

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/history?page=${pagination.page}&limit=${pagination.limit}`)
      if (response.ok) {
        const data = await response.json()
        setHistory(data.data)
        setPagination(prev => ({
          ...prev,
          ...data.pagination
        }))
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  const goToPage = (page) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const calculateDuration = (start, end) => {
    const startTime = new Date(start)
    const endTime = new Date(end)
    const diffMinutes = Math.floor((endTime - startTime) / (1000 * 60))
    return diffMinutes
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Memuat riwayat...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Riwayat Tugas</h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
              Lihat semua tugas yang telah Anda selesaikan dan analisis produktivitas Anda
            </p>
          </div>

          {history.length > 0 ? (
            <>
              {/* History List */}
              <div className="space-y-4 sm:space-y-6">
                {history.map((item) => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3 sm:pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                          <div 
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white text-base sm:text-lg font-bold flex-shrink-0"
                            style={{ backgroundColor: item.tugas.kategori.warna }}
                          >
                            {item.tugas.kategori.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base sm:text-xl mb-1 sm:mb-2">{item.tugas.judul}</CardTitle>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                                <span>Selesai</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span>{formatDate(item.createdAt)}</span>
                              </div>
                              <span 
                                className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium self-start"
                                style={{ 
                                  backgroundColor: item.tugas.kategori.warna + '20', 
                                  color: item.tugas.kategori.warna 
                                }}
                              >
                                {item.tugas.kategori.nama}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-2 sm:ml-0">
                          <div className="text-sm sm:text-lg font-bold text-green-600">
                            {formatDuration(item.tugas.waktuSelesai || calculateDuration(item.waktuMulai, item.waktuSelesai))}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            <span className="hidden sm:inline">Waktu Selesai</span>
                            <span className="sm:hidden">Waktu</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      {item.tugas.deskripsi && (
                        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{item.tugas.deskripsi}</p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <span className="text-gray-500 block">Prioritas</span>
                          <span className={`font-medium ${
                            item.tugas.prioritas === 'LOW' ? 'text-green-600' :
                            item.tugas.prioritas === 'MEDIUM' ? 'text-yellow-600' :
                            item.tugas.prioritas === 'HIGH' ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            {item.tugas.prioritas}
                          </span>
                        </div>
                        
                        {item.tugas.estimasiWaktu && (
                          <div>
                            <span className="text-gray-500 block">Estimasi</span>
                            <span>{formatDuration(item.tugas.estimasiWaktu)}</span>
                          </div>
                        )}
                        
                        <div>
                          <span className="text-gray-500 block">Mulai</span>
                          <span>{new Date(item.waktuMulai).toLocaleTimeString('id-ID', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}</span>
                        </div>
                        
                        <div>
                          <span className="text-gray-500 block">Selesai</span>
                          <span>{new Date(item.waktuSelesai).toLocaleTimeString('id-ID', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}</span>
                        </div>
                      </div>
                      
                      {item.catatanTambahan && (
                        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-500 text-xs sm:text-sm block mb-1">Catatan</span>
                          <p className="text-sm sm:text-base text-gray-700">{item.catatanTambahan}</p>
                        </div>
                      )}
                      
                      {item.tugas.estimasiWaktu && item.tugas.waktuSelesai && (
                        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 rounded-lg">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                            <span className="text-blue-700 font-medium text-sm">Analisis Waktu</span>
                            <span className={`text-xs sm:text-sm font-medium ${
                              item.tugas.waktuSelesai <= item.tugas.estimasiWaktu 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              {item.tugas.waktuSelesai <= item.tugas.estimasiWaktu 
                                ? `Lebih cepat ${formatDuration(item.tugas.estimasiWaktu - item.tugas.waktuSelesai)}`
                                : `Lebih lama ${formatDuration(item.tugas.waktuSelesai - item.tugas.estimasiWaktu)}`
                              }
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-6 sm:mt-8 flex justify-center items-center space-x-2 sm:space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="text-xs sm:text-sm"
                  >
                    <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                    <span className="sm:hidden">Prev</span>
                  </Button>
                  
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={pagination.page === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(page)}
                          className="text-xs sm:text-sm w-8 h-8 sm:w-auto sm:h-auto p-1 sm:px-3 sm:py-2"
                        >
                          {page}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">Selanjutnya</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                  </Button>
                </div>
              )}

              {/* Summary */}
              <Card className="mt-6 sm:mt-8">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg">Ringkasan Riwayat</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-center">
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">{pagination.total}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Total Tugas Selesai</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-green-600">
                        {formatDuration(
                          history.reduce((total, item) => 
                            total + (item.tugas.waktuSelesai || 0), 0
                          )
                        )}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Total Waktu Produktif</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-purple-600">
                        {history.length > 0 
                          ? formatDuration(
                              Math.round(
                                history.reduce((total, item) => 
                                  total + (item.tugas.waktuSelesai || 0), 0
                                ) / history.length
                              )
                            )
                          : '0m'
                        }
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Rata-rata per Tugas</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-8 sm:py-12">
                <div className="text-center">
                  <History className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    Belum Ada Riwayat
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                    Mulai menyelesaikan tugas untuk melihat riwayat aktivitas Anda
                  </p>
                  <Button onClick={() => router.push('/tugas')} className="text-sm">
                    Kelola Tugas
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
