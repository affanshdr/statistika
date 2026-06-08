import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEFAULT_CLASSROOMS = [
  { name: 'Kelas Uji Coba', grade: '-', major: '-' },
]

export async function GET() {
  try {
    // Seed kalau belum ada
    const count = await prisma.classroom.count()
    if (count === 0) {
      await prisma.classroom.createMany({ data: DEFAULT_CLASSROOMS })
    }

    const classrooms = await prisma.classroom.findMany({
      orderBy: [{ major: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json(classrooms)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal mengambil data kelas' }, { status: 500 })
  }
}