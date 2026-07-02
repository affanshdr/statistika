import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper untuk generate 10 digit NISN acak yang unik di DB
async function generateUniqueNisn(): Promise<string> {
  let nisn = ''
  let isUnique = false
  while (!isUnique) {
    nisn = Math.floor(1000000000 + Math.random() * 9000000000).toString()
    const existing = await prisma.student.findUnique({ where: { nisn } })
    if (!existing) isUnique = true
  }
  return nisn
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const classroomId = searchParams.get('classroomId')

    const whereClause = classroomId ? { classroomId } : {}

    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        classroom: true,
        geftResult: true,
        leaderboard: true,
        gameSessions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(students)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal memproses data siswa' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, classroomId } = await req.json()

    if (!name || !classroomId) {
      return NextResponse.json({ error: 'Nama dan kelas wajib diisi' }, { status: 400 })
    }

    const cleanName = name.trim()

    // Cari siswa dengan nama dan kelas yang sama (untuk login kembali)
    let student = await prisma.student.findFirst({
      where: {
        name: { equals: cleanName, mode: 'insensitive' },
        classroomId,
      },
      include: { classroom: true, geftResult: true },
    })

    // Jika tidak ditemukan, cari apakah siswa dengan nama yang sama ada di kelas lain
    if (!student) {
      const existingStudent = await prisma.student.findFirst({
        where: { name: { equals: cleanName, mode: 'insensitive' } },
        include: { classroom: true, geftResult: true },
      })

      if (existingStudent) {
        student = await prisma.student.update({
          where: { id: existingStudent.id },
          data: { classroomId },
          include: { classroom: true, geftResult: true },
        })
      }
    }

    // Buat siswa baru
    if (!student) {
      const generatedNisn = await generateUniqueNisn()
      student = await prisma.student.create({
        data: { name: cleanName, nisn: generatedNisn, classroomId },
        include: { classroom: true, geftResult: true },
      })
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal memproses data siswa' }, { status: 500 })
  }
}

// PUT - Update student (pindah kelas atau ubah nama)
export async function PUT(req: NextRequest) {
  try {
    const { id, name, classroomId } = await req.json()
    if (!id) {
      return NextResponse.json({ error: 'ID siswa wajib disertakan' }, { status: 400 })
    }

    const updateData: { name?: string; classroomId?: string } = {}
    if (name && name.trim()) updateData.name = name.trim()
    if (classroomId) updateData.classroomId = classroomId

    const student = await prisma.student.update({
      where: { id },
      data: updateData,
      include: { classroom: true, geftResult: true },
    })

    return NextResponse.json(student)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal memperbarui data siswa' }, { status: 500 })
  }
}

// DELETE - Hapus siswa
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID siswa wajib disertakan' }, { status: 400 })
    }

    // Hapus relasi dulu (urutan: child before parent)
    await prisma.geftResult.deleteMany({ where: { studentId: id } })
    await prisma.gameSession.deleteMany({ where: { studentId: id } })
    await prisma.leaderboard.deleteMany({ where: { studentId: id } })
    await prisma.student.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal menghapus siswa' }, { status: 500 })
  }
}