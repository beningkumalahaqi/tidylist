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
    const data = await request.json()

    // Verify ownership
    const existingTugas = await prisma.tugas.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingTugas) {
      return NextResponse.json(
        { error: 'Tugas tidak ditemukan' },
        { status: 404 }
      )
    }

    const updateData = {
      ...data,
      ...(data.estimasiWaktu && { estimasiWaktu: parseInt(data.estimasiWaktu) }),
      ...(data.waktuSelesai && { waktuSelesai: parseInt(data.waktuSelesai) }),
      ...(data.deadline && { deadline: new Date(data.deadline) }),
      ...(data.status === 'COMPLETED' && !existingTugas.completedAt && { completedAt: new Date() }),
      ...(data.status !== 'COMPLETED' && existingTugas.completedAt && { completedAt: null })
    }

    const tugas = await prisma.tugas.update({
      where: { id },
      data: updateData,
      include: {
        kategori: true
      }
    })

    // Create history record if task is completed
    if (data.status === 'COMPLETED' && !existingTugas.completedAt && data.waktuSelesai) {
      await prisma.riwayatTugas.create({
        data: {
          tugasId: id,
          waktuMulai: existingTugas.createdAt,
          waktuSelesai: new Date(),
          catatanTambahan: data.catatanTambahan || null
        }
      })
    }

    return NextResponse.json(tugas)

  } catch (error) {
    console.error('Update tugas error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate tugas' },
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
    const existingTugas = await prisma.tugas.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingTugas) {
      return NextResponse.json(
        { error: 'Tugas tidak ditemukan' },
        { status: 404 }
      )
    }

    await prisma.tugas.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Tugas berhasil dihapus' })

  } catch (error) {
    console.error('Delete tugas error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus tugas' },
      { status: 500 }
    )
  }
}
