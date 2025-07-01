import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../../lib/prisma'

export async function POST(request) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
      }
    })

    // Create default categories for new user
    const defaultCategories = [
      { nama: 'Belajar', warna: '#3B82F6', icon: '📚' },
      { nama: 'Kerja', warna: '#10B981', icon: '💼' },
      { nama: 'Olahraga', warna: '#F59E0B', icon: '🏃' },
      { nama: 'Pribadi', warna: '#EF4444', icon: '🏠' },
    ]

    await prisma.kategori.createMany({
      data: defaultCategories.map(category => ({
        ...category,
        userId: user.id
      }))
    })

    return NextResponse.json({
      message: 'Akun berhasil dibuat',
      user
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat akun' },
      { status: 500 }
    )
  }
}
