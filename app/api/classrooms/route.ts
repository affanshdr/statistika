import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const DEFAULT_CLASSROOMS = [
  { name: 'Kelas Uji Coba', grade: '-', major: '-' },
  { name: 'Testing', grade: '-', major: '-' },
]

// GET - Fetch all classrooms with student count & cognitive stats
export async function GET() {
  try {
    // Seed kalau belum ada
    const count = await prisma.classroom.count()
    if (count === 0) {
      await prisma.classroom.createMany({ data: DEFAULT_CLASSROOMS })
    } else {
      const testingClass = await prisma.classroom.findFirst({ where: { name: 'Testing' } })
      if (!testingClass) {
        await prisma.classroom.create({ data: { name: 'Testing', grade: '-', major: '-' } })
      }
    }

    const classrooms = await prisma.classroom.findMany({
      orderBy: [{ major: 'asc' }, { name: 'asc' }],
      include: {
        students: {
          include: {
            geftResult: true,
          },
        },
      },
    })

    // Map dengan stats
    const result = classrooms.map((cls) => {
      const totalStudents = cls.students.length
      const fiCount = cls.students.filter((s) => s.geftResult?.cognitiveStyle === 'FI').length
      const fdCount = cls.students.filter((s) => s.geftResult?.cognitiveStyle === 'FD').length
      return {
        id: cls.id,
        name: cls.name,
        grade: cls.grade,
        major: cls.major,
        totalStudents,
        fiCount,
        fdCount,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal mengambil data kelas' }, { status: 500 })
  }
}

// POST - Create new classroom
export async function POST(req: NextRequest) {
  try {
    const { name, grade, major } = await req.json()
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nama kelas wajib diisi' }, { status: 400 })
    }
    const classroom = await prisma.classroom.create({
      data: {
        name: name.trim(),
        grade: grade?.trim() || '-',
        major: major?.trim() || '-',
      },
    })
    return NextResponse.json(classroom, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal membuat kelas' }, { status: 500 })
  }
}

// PUT - Update classroom
export async function PUT(req: NextRequest) {
  try {
    const { id, name, grade, major } = await req.json()
    if (!id || !name || !name.trim()) {
      return NextResponse.json({ error: 'ID dan Nama kelas wajib diisi' }, { status: 400 })
    }
    const classroom = await prisma.classroom.update({
      where: { id },
      data: {
        name: name.trim(),
        grade: grade?.trim() || '-',
        major: major?.trim() || '-',
      },
    })
    return NextResponse.json(classroom)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal memperbarui kelas' }, { status: 500 })
  }
}

// DELETE - Delete classroom (blocked if has students)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID kelas wajib disertakan' }, { status: 400 })
    }

    const studentCount = await prisma.student.count({ where: { classroomId: id } })
    if (studentCount > 0) {
      return NextResponse.json(
        { error: `Kelas masih memiliki ${studentCount} siswa. Pindahkan atau hapus siswa terlebih dahulu.` },
        { status: 409 }
      )
    }

    await prisma.classroom.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal menghapus kelas' }, { status: 500 })
  }
}