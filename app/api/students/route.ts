import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { name, nisn, classroomId } = await req.json()

    if (!name || !nisn || !classroomId) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }

    if (!/^\d{10}$/.test(nisn)) {
      return NextResponse.json({ error: 'NISN harus 10 digit angka' }, { status: 400 })
    }

    // Kalau NISN sudah ada, update nama & kelas (siswa kembali lagi)
    const student = await prisma.student.upsert({
      where: { nisn },
      update: { name, classroomId },
      create: { name, nisn, classroomId },
      include: { classroom: true },
    })

    return NextResponse.json(student)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal menyimpan data siswa' }, { status: 500 })
  }
}