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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const kategoriId = searchParams.get('kategoriId')

    const where = {
      userId: session.user.id,
      ...(status && { status }),
      ...(kategoriId && { kategoriId })
    }

    const tugas = await prisma.tugas.findMany({
      where,
      include: {
        kategori: true
      },
      orderBy: [
        { status: 'asc' },
        { prioritas: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(tugas)

  } catch (error) {
    console.error('Get tugas error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data tugas' },
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

    const { judul, deskripsi, kategoriId, prioritas, estimasiWaktu, deadline } = await request.json()

    if (!judul || !kategoriId) {
      return NextResponse.json(
        { error: 'Judul dan kategori wajib diisi' },
        { status: 400 }
      )
    }

    const tugas = await prisma.tugas.create({
      data: {
        judul,
        deskripsi,
        kategoriId,
        prioritas: prioritas || 'MEDIUM',
        estimasiWaktu: estimasiWaktu ? parseInt(estimasiWaktu) : null,
        deadline: deadline ? new Date(deadline) : null,
        userId: session.user.id
      },
      include: {
        kategori: true
      }
    })

    return NextResponse.json(tugas, { status: 201 })

  } catch (error) {
    console.error('Create tugas error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat tugas' },
      { status: 500 }
    )
  }
}
