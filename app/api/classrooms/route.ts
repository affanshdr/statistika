import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const DEFAULT_CLASSROOMS = [
  { name: 'Kelas Uji Coba', grade: '-', major: '-' },
  { name: 'Testing', grade: '-', major: '-' },
]

export async function GET() {
  try {
    // Seed kalau belum ada
    const count = await prisma.classroom.count()
    if (count === 0) {
      await prisma.classroom.createMany({ data: DEFAULT_CLASSROOMS })
    } else {
      // Pastikan kelas "Testing" ada supaya data sebelumnya tidak hilang
      const testingClass = await prisma.classroom.findFirst({
        where: { name: 'Testing' }
      })
      if (!testingClass) {
        await prisma.classroom.create({
          data: { name: 'Testing', grade: '-', major: '-' }
        })
      }
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