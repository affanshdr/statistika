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
    const students = await prisma.student.findMany({
      include: {
        classroom: true,
        geftResult: true,
        leaderboard: true
      },
      orderBy: { createdAt: 'desc' }
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
        name: {
          equals: cleanName,
          mode: 'insensitive', // case-insensitive agar lebih fleksibel
        },
        classroomId,
      },
      include: {
        classroom: true,
        geftResult: true,
      },
    })

    // Jika tidak ditemukan, buat siswa baru dengan generate NISN acak di backend
    if (!student) {
      const generatedNisn = await generateUniqueNisn()
      student = await prisma.student.create({
        data: {
          name: cleanName,
          nisn: generatedNisn,
          classroomId,
        },
        include: {
          classroom: true,
          geftResult: true,
        },
      })
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal memproses data siswa' }, { status: 500 })
  }
}