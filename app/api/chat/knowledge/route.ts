import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET: Fetch all knowledge items
 */
export async function GET(req: NextRequest) {
  try {
    const items = await prisma.chatbotKnowledge.findMany({
      orderBy: { updatedAt: 'desc' }
    })
    return NextResponse.json(items)
  } catch (error: any) {
    console.error('Fetch knowledge error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data pengetahuan chatbot' }, { status: 500 })
  }
}

/**
 * POST: Create a new knowledge item
 */
export async function POST(req: NextRequest) {
  try {
    const { title, content, category } = await req.json()

    if (!title || !content) {
      return NextResponse.json({ error: 'Judul dan konten wajib diisi' }, { status: 400 })
    }

    const newItem = await prisma.chatbotKnowledge.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category: category || 'umum'
      }
    })

    return NextResponse.json(newItem)
  } catch (error: any) {
    console.error('Create knowledge error:', error)
    return NextResponse.json({ error: 'Gagal menambah data pengetahuan chatbot' }, { status: 500 })
  }
}

/**
 * PUT: Update an existing knowledge item
 */
export async function PUT(req: NextRequest) {
  try {
    const { id, title, content, category } = await req.json()

    if (!id || !title || !content) {
      return NextResponse.json({ error: 'ID, judul, dan konten wajib diisi' }, { status: 400 })
    }

    const updatedItem = await prisma.chatbotKnowledge.update({
      where: { id },
      data: {
        title: title.trim(),
        content: content.trim(),
        category: category || 'umum'
      }
    })

    return NextResponse.json(updatedItem)
  } catch (error: any) {
    console.error('Update knowledge error:', error)
    return NextResponse.json({ error: 'Gagal mengubah data pengetahuan chatbot' }, { status: 500 })
  }
}

/**
 * DELETE: Remove a knowledge item
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan untuk menghapus data' }, { status: 400 })
    }

    await prisma.chatbotKnowledge.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Data berhasil dihapus' })
  } catch (error: any) {
    console.error('Delete knowledge error:', error)
    return NextResponse.json({ error: 'Gagal menghapus data pengetahuan chatbot' }, { status: 500 })
  }
}
