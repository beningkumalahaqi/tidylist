'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const router = useRouter()
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      if (isRegister) {
        // Register
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (response.ok) {
          toast.success('Akun berhasil dibuat!')
          setIsRegister(false)
          reset()
        } else {
          toast.error(result.error || 'Terjadi kesalahan')
        }
      } else {
        // Login
        const result = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
        })

        if (result?.error) {
          toast.error('Email atau password salah')
        } else {
          toast.success('Login berhasil!')
          router.push('/')
        }
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🧹 TidyList</h1>
          <p className="text-gray-600">Minimalist Time-Tracking To-Do App</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isRegister ? 'Daftar Akun' : 'Masuk'}</CardTitle>
            <CardDescription>
              {isRegister 
                ? 'Buat akun baru untuk mulai menggunakan TidyList'
                : 'Masuk ke akun TidyList Anda'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {isRegister && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nama (Opsional)
                  </label>
                  <Input
                    id="name"
                    type="text"
                    {...register('name')}
                    placeholder="Masukkan nama Anda"
                  />
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', { required: 'Email wajib diisi' })}
                  placeholder="Masukkan email Anda"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  {...register('password', { 
                    required: 'Password wajib diisi',
                    minLength: { value: 6, message: 'Password minimal 6 karakter' }
                  })}
                  placeholder="Masukkan password Anda"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : (isRegister ? 'Daftar' : 'Masuk')}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister)
                  reset()
                }}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {isRegister 
                  ? 'Sudah punya akun? Masuk di sini'
                  : 'Belum punya akun? Daftar di sini'
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
