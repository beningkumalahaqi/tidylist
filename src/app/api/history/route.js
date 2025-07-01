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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const riwayat = await prisma.riwayatTugas.findMany({
      where: {
        tugas: {
          userId: session.user.id
        }
      },
      include: {
        tugas: {
          include: {
            kategori: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    const total = await prisma.riwayatTugas.count({
      where: {
        tugas: {
          userId: session.user.id
        }
      }
    })

    return NextResponse.json({
      data: riwayat,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('History error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil riwayat tugas' },
      { status: 500 }
    )
  }
}
