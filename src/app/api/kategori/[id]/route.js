import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params
    const { nama, warna, icon } = await request.json()

    if (!nama) {
      return NextResponse.json(
        { error: 'Nama kategori wajib diisi' },
        { status: 400 }
      )
    }

    // Verify ownership
    const existingKategori = await prisma.kategori.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingKategori) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan' },
        { status: 404 }
      )
    }

    const kategori = await prisma.kategori.update({
      where: { id },
      data: {
        nama,
        warna: warna || '#3B82F6',
        icon: icon || '📝'
      }
    })

    return NextResponse.json(kategori)

  } catch (error) {
    console.error('Update kategori error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate kategori' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params

    // Verify ownership
    const existingKategori = await prisma.kategori.findFirst({
      where: {
        id,
        userId: session.user.id
      },
      include: {
        _count: {
          select: {
            tugas: true
          }
        }
      }
    })

    if (!existingKategori) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if category has tasks
    if (existingKategori._count.tugas > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus kategori yang masih memiliki tugas' },
        { status: 400 }
      )
    }

    await prisma.kategori.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Kategori berhasil dihapus' })

  } catch (error) {
    console.error('Delete kategori error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus kategori' },
      { status: 500 }
    )
  }
}
