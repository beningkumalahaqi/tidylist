import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const kategoris = await prisma.kategori.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        _count: {
          select: {
            tugas: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json(kategoris)

  } catch (error) {
    console.error('Get kategori error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data kategori' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { nama, warna, icon } = await request.json()

    if (!nama) {
      return NextResponse.json(
        { error: 'Nama kategori wajib diisi' },
        { status: 400 }
      )
    }

    const kategori = await prisma.kategori.create({
      data: {
        nama,
        warna: warna || '#3B82F6',
        icon: icon || '📝',
        userId: session.user.id
      }
    })

    return NextResponse.json(kategori, { status: 201 })

  } catch (error) {
    console.error('Create kategori error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat kategori' },
      { status: 500 }
    )
  }
}
