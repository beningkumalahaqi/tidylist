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
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag,
  Palette
} from 'lucide-react'

const defaultColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
]

const defaultIcons = ['📚', '💼', '🏃', '🏠', '🍽️', '🎵', '🎮', '✈️', '🚗', '💰', '🎯', '📱']

export default function KategoriPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [kategoris, setKategoris] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingKategori, setEditingKategori] = useState(null)
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    defaultValues: {
      warna: '#3B82F6',
      icon: '📝'
    }
  })

  const selectedColor = watch('warna')
  const selectedIcon = watch('icon')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    fetchKategoris()
  }, [session, status, router])

  const fetchKategoris = async () => {
    try {
      const response = await fetch('/api/kategori')
      if (response.ok) {
        const data = await response.json()
        setKategoris(data)
      }
    } catch (error) {
      toast.error('Gagal memuat kategori')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      const url = editingKategori ? `/api/kategori/${editingKategori.id}` : '/api/kategori'
      const method = editingKategori ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success(editingKategori ? 'Kategori berhasil diupdate' : 'Kategori berhasil dibuat')
        setShowModal(false)
        setEditingKategori(null)
        reset()
        fetchKategoris()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  const deleteKategori = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini? Semua tugas dalam kategori ini akan ikut terhapus.')) return

    try {
      const response = await fetch(`/api/kategori/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Kategori berhasil dihapus')
        fetchKategoris()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menghapus kategori')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  const openEditModal = (kategori) => {
    setEditingKategori(kategori)
    setValue('nama', kategori.nama)
    setValue('warna', kategori.warna)
    setValue('icon', kategori.icon)
    setShowModal(true)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Memuat kategori...</p>
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
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex-1 pr-4">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Manajemen Kategori</h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Kelola kategori untuk mengorganisir tugas Anda</p>
            </div>
            <Button 
              onClick={() => {
                setEditingKategori(null)
                reset({
                  warna: '#3B82F6',
                  icon: '📝'
                })
                setShowModal(true)
              }}
              className="flex items-center justify-center space-x-2 h-10 sm:h-auto px-3 sm:px-4 flex-shrink-0 pr-1"
              aria-label="Tambah Kategori"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Tambah Kategori</span>
            </Button>
          </div>

          {/* Categories Grid */}
          {kategoris.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {kategoris.map((kategori) => (
                <Card key={kategori.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div 
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white text-base sm:text-lg font-bold"
                          style={{ backgroundColor: kategori.warna }}
                        >
                          {kategori.icon}
                        </div>
                        <div>
                          <CardTitle className="text-base sm:text-lg">{kategori.nama}</CardTitle>
                          <CardDescription className="text-xs sm:text-sm">
                            {kategori._count?.tugas || 0} tugas
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => openEditModal(kategori)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => deleteKategori(kategori.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                          disabled={kategori._count?.tugas > 0}
                        >
                          <Trash2 className={`h-3 w-3 sm:h-4 sm:w-4 ${kategori._count?.tugas > 0 ? 'text-gray-300' : 'text-red-500'}`} />
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 sm:space-y-2">
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span className="text-gray-500">Warna</span>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: kategori.warna }}
                          ></div>
                          <span className="text-xs text-gray-600">{kategori.warna}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span className="text-gray-500">Icon</span>
                        <span className="text-base sm:text-lg">{kategori.icon}</span>
                      </div>
                      
                      {kategori._count?.tugas > 0 && (
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                          <div className="text-center">
                            <p className="text-xs sm:text-sm text-gray-600">
                              Kategori ini memiliki {kategori._count.tugas} tugas
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 sm:py-12">
                <div className="text-center">
                  <Tag className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    Belum Ada Kategori
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                    Mulai dengan membuat kategori untuk mengorganisir tugas Anda
                  </p>
                  <Button onClick={() => setShowModal(true)} className="text-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Tambah Kategori</span>
                    <span className="sm:hidden">Tambah</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
              {editingKategori ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="nama" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Nama Kategori *
                </label>
                <Input
                  id="nama"
                  {...register('nama', { required: 'Nama kategori wajib diisi' })}
                  placeholder="Masukkan nama kategori"
                  className="text-sm"
                />
                {errors.nama && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.nama.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Icon *
                </label>
                <div className="grid grid-cols-6 gap-1 sm:gap-2 mb-2 sm:mb-3">
                  {defaultIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setValue('icon', icon)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 text-sm sm:text-lg rounded border-2 hover:border-blue-300 ${
                        selectedIcon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <Input
                  {...register('icon', { required: 'Icon wajib dipilih' })}
                  placeholder="Atau masukkan emoji sendiri"
                  className="text-center text-sm"
                />
                {errors.icon && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.icon.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Warna *
                </label>
                <div className="grid grid-cols-5 gap-1 sm:gap-2 mb-2 sm:mb-3">
                  {defaultColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setValue('warna', color)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded border-2 hover:border-gray-400 ${
                        selectedColor === color ? 'border-gray-600' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && (
                        <span className="text-white text-xs sm:text-sm">✓</span>
                      )}
                    </button>
                  ))}
                </div>
                <Input
                  type="color"
                  {...register('warna', { required: 'Warna wajib dipilih' })}
                  className="h-8 sm:h-10"
                />
                {errors.warna && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.warna.message}</p>
                )}
              </div>

              {/* Preview */}
              <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div 
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white text-base sm:text-lg font-bold"
                    style={{ backgroundColor: selectedColor }}
                  >
                    {selectedIcon}
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">
                      {watch('nama') || 'Nama Kategori'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">0 tugas</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-3 sm:pt-4">
                <Button type="submit" className="flex-1 text-sm">
                  {editingKategori ? 'Update' : 'Simpan'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowModal(false)
                    setEditingKategori(null)
                    reset()
                  }}
                  className="flex-1 text-sm"
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
