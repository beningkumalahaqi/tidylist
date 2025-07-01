'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Navigation from '../../components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { formatDuration } from '../../lib/utils'
import { 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Play,
  Pause,
  Square
} from 'lucide-react'

export default function TugasPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tugas, setTugas] = useState([])
  const [kategoris, setKategoris] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTugas, setEditingTugas] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    fetchTugas()
    fetchKategoris()
  }, [session, status, router])

  const fetchTugas = async () => {
    try {
      const response = await fetch('/api/tugas')
      if (response.ok) {
        const data = await response.json()
        setTugas(data)
      }
    } catch (error) {
      toast.error('Gagal memuat tugas')
    } finally {
      setLoading(false)
    }
  }

  const fetchKategoris = async () => {
    try {
      const response = await fetch('/api/kategori')
      if (response.ok) {
        const data = await response.json()
        setKategoris(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const onSubmit = async (data) => {
    try {
      const url = editingTugas ? `/api/tugas/${editingTugas.id}` : '/api/tugas'
      const method = editingTugas ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success(editingTugas ? 'Tugas berhasil diupdate' : 'Tugas berhasil dibuat')
        setShowModal(false)
        setEditingTugas(null)
        reset()
        fetchTugas()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  const deleteTugas = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tugas ini?')) return

    try {
      const response = await fetch(`/api/tugas/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Tugas berhasil dihapus')
        fetchTugas()
      } else {
        toast.error('Gagal menghapus tugas')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  const updateTugasStatus = async (id, status, waktuSelesai = null) => {
    try {
      const response = await fetch(`/api/tugas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, waktuSelesai }),
      })

      if (response.ok) {
        toast.success(`Tugas ${status === 'COMPLETED' ? 'selesai' : 'diupdate'}`)
        fetchTugas()
      } else {
        toast.error('Gagal mengupdate tugas')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  const openEditModal = (tugasItem) => {
    setEditingTugas(tugasItem)
    setValue('judul', tugasItem.judul)
    setValue('deskripsi', tugasItem.deskripsi || '')
    setValue('kategoriId', tugasItem.kategoriId)
    setValue('prioritas', tugasItem.prioritas)
    setValue('estimasiWaktu', tugasItem.estimasiWaktu || '')
    setValue('deadline', tugasItem.deadline ? new Date(tugasItem.deadline).toISOString().slice(0, 16) : '')
    setShowModal(true)
  }

  const filteredTugas = tugas.filter(task => {
    if (filterStatus === 'all') return true
    if (filterStatus === 'completed') return task.status === 'COMPLETED'
    if (filterStatus === 'pending') return task.status !== 'COMPLETED'
    return true
  })

  const getPriorityColor = (prioritas) => {
    switch (prioritas) {
      case 'LOW': return 'text-green-600'
      case 'MEDIUM': return 'text-yellow-600'
      case 'HIGH': return 'text-orange-600'
      case 'URGENT': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'IN_PROGRESS': return <Clock className="h-5 w-5 text-blue-600" />
      case 'CANCELLED': return <Square className="h-5 w-5 text-red-600" />
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Memuat tugas...</p>
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manajemen Tugas</h1>
              <p className="mt-2 text-gray-600">Kelola dan lacak semua tugas Anda</p>
            </div>
            <Button 
              onClick={() => {
                setEditingTugas(null)
                reset()
                setShowModal(true)
              }}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Tugas</span>
            </Button>
          </div>

          {/* Filter */}
          <div className="mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filterStatus === 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Semua ({tugas.length})
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filterStatus === 'pending' 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Belum Selesai ({tugas.filter(t => t.status !== 'COMPLETED').length})
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filterStatus === 'completed' 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Selesai ({tugas.filter(t => t.status === 'COMPLETED').length})
              </button>
            </div>
          </div>

          {/* Tasks Grid */}
          {filteredTugas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTugas.map((task) => (
                <Card key={task.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{task.judul}</CardTitle>
                        <div className="flex items-center space-x-2 mt-2">
                          {getStatusIcon(task.status)}
                          <span 
                            className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: task.kategori.warna + '20', color: task.kategori.warna }}
                          >
                            {task.kategori.icon} {task.kategori.nama}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => openEditModal(task)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Edit className="h-4 w-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => deleteTugas(task.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {task.deskripsi && (
                      <p className="text-gray-600 text-sm mb-3">{task.deskripsi}</p>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Prioritas</span>
                        <span className={`font-medium ${getPriorityColor(task.prioritas)}`}>
                          {task.prioritas}
                        </span>
                      </div>
                      
                      {task.estimasiWaktu && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Estimasi</span>
                          <span>{formatDuration(task.estimasiWaktu)}</span>
                        </div>
                      )}
                      
                      {task.waktuSelesai && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Waktu Selesai</span>
                          <span className="text-green-600">{formatDuration(task.waktuSelesai)}</span>
                        </div>
                      )}
                      
                      {task.deadline && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Deadline</span>
                          <span>{new Date(task.deadline).toLocaleDateString('id-ID')}</span>
                        </div>
                      )}
                    </div>

                    {task.status !== 'COMPLETED' && (
                      <div className="mt-4 pt-4 border-t flex space-x-2">
                        {task.status === 'PENDING' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTugasStatus(task.id, 'IN_PROGRESS')}
                            className="flex-1"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Mulai
                          </Button>
                        )}
                        
                        {task.status === 'IN_PROGRESS' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const waktu = prompt('Berapa menit waktu yang dihabiskan?', task.estimasiWaktu || '')
                              if (waktu && !isNaN(waktu)) {
                                updateTugasStatus(task.id, 'COMPLETED', parseInt(waktu))
                              }
                            }}
                            className="flex-1"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Selesai
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {filterStatus === 'all' ? 'Belum Ada Tugas' : 'Tidak Ada Tugas'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {filterStatus === 'all' 
                      ? 'Mulai dengan membuat tugas pertama Anda'
                      : `Tidak ada tugas dengan filter ${filterStatus === 'completed' ? 'selesai' : 'belum selesai'}`
                    }
                  </p>
                  {filterStatus === 'all' && (
                    <Button onClick={() => setShowModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Tugas
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingTugas ? 'Edit Tugas' : 'Tambah Tugas Baru'}
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="judul" className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Tugas *
                </label>
                <Input
                  id="judul"
                  {...register('judul', { required: 'Judul wajib diisi' })}
                  placeholder="Masukkan judul tugas"
                />
                {errors.judul && (
                  <p className="text-red-500 text-sm mt-1">{errors.judul.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                id="deskripsi"
                {...register('deskripsi')}
                placeholder="Deskripsi tugas (opsional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-black dark:border-gray-600 dark:text-white dark:placeholder-gray-400 font-small text-sm"
                rows={3}
                  />
              </div>

              <div>
                <label htmlFor="kategoriId" className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori *
                </label>
                <select
                  id="kategoriId"
                  {...register('kategoriId', { required: 'Kategori wajib dipilih' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-black dark:border-gray-600 dark:text-gray-400 dark:placeholder-gray-400"
                >
                  <option value="">Pilih kategori</option>
                  {kategoris.map((kategori) => (
                    <option key={kategori.id} value={kategori.id}>
                      {kategori.icon} {kategori.nama}
                    </option>
                  ))}
                </select>
                {errors.kategoriId && (
                  <p className="text-red-500 text-sm mt-1">{errors.kategoriId.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="prioritas" className="block text-sm font-medium text-gray-700 mb-1">
                  Prioritas
                </label>
                <select
                  id="prioritas"
                  {...register('prioritas')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-black dark:border-gray-600 dark:text-gray-400 dark:placeholder-gray-400"
                >
                  <option value="LOW">Rendah</option>
                  <option value="MEDIUM">Sedang</option>
                  <option value="HIGH">Tinggi</option>
                  <option value="URGENT">Mendesak</option>
                </select>
              </div>

              <div>
                <label htmlFor="estimasiWaktu" className="block text-sm font-medium text-gray-700 mb-1">
                  Estimasi Waktu (menit)
                </label>
                <Input
                  id="estimasiWaktu"
                  type="number"
                  {...register('estimasiWaktu')}
                  placeholder="Contoh: 60"
                  min="0"
                />
              </div>

              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline
                </label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  {...register('deadline')}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingTugas ? 'Update' : 'Simpan'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowModal(false)
                    setEditingTugas(null)
                    reset()
                  }}
                  className="flex-1"
                >
                  Batal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
