<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# AR-CogniStats — Panduan Kerja AI Agent

> **Project:** `ar-cognistats` — Platform pembelajaran statistika adaptif berbasis gaya kognitif (GEFT), gamifikasi, dan kolaborasi real-time.
> **Stack:** Next.js 16 · React 19 · TypeScript 5 (strict) · Tailwind CSS v4 · Prisma 5 + PostgreSQL (Supabase) · Zustand 5 · Framer Motion · DnD Kit

---

## 1. Peran & Tujuan Agent

Kamu adalah AI coding assistant yang membantu mengembangkan, memperbaiki, dan memelihara codebase ini. Selalu prioritaskan:

1. **Struktur folder ringan** — hindari membuat file/direktori baru yang tidak perlu.
2. **Best practice TypeScript & React** — strict typing, no `any`, no `ts-ignore`.
3. **Konsistensi pola** — ikuti pola yang sudah ada di codebase sebelum membuat pola baru.
4. **Performa** — Server Components by default; tandai `'use client'` hanya jika membutuhkan state/effects.

---

## 2. Struktur Folder Kanonikal

```
statistika/
├── app/                         # Next.js App Router (route segments)
│   ├── api/                     # Route Handlers (API endpoints)
│   │   ├── game/                # Endpoint game (sessions, leaderboard, dll.)
│   │   ├── guru/                # Endpoint data guru/kelas
│   │   └── students/            # Endpoint data siswa
│   ├── guru/                    # Halaman dashboard guru
│   │   └── page.tsx
│   ├── siswa/                   # Halaman utama siswa
│   │   ├── game/                # Sub-rute halaman game
│   │   ├── geft/
│   │   ├── diagnostik/
│   │   ├── chat/
│   │   ├── modul/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── landing/                 # Halaman landing publik
│   ├── globals.css
│   ├── layout.tsx               # Root layout (font, metadata global)
│   └── page.tsx                 # Root page (redirect / landing entry)
│
├── components/                  # Shared UI components
│   ├── landing/                 # Komponen section landing page
│   ├── ChatWidget.tsx
│   └── NetworkStatusBanner.tsx
│
├── lib/                         # Business logic, utilities, non-UI code
│   ├── chatbot/                 # Logika chatbot & knowledge base
│   ├── hooks/                   # Custom React hooks
│   ├── store/                   # Zustand stores
│   ├── prisma.ts                # Singleton Prisma client
│   └── supabase.ts              # Singleton Supabase client (browser-side)
│
├── prisma/
│   └── schema.prisma            # Sumber kebenaran tunggal skema database
│
├── public/                      # Aset statis (gambar, font, audio)
├── scripts/                     # Script Node.js satu-kali (bukan Next.js)
└── src/
    └── generated/prisma/        # Output prisma generate (JANGAN diedit manual)
```

### Aturan Struktur Folder

| Aturan | Detail |
|--------|--------|
| **Server Components first** | Semua `page.tsx` adalah Server Component kecuali wajib interaktif |
| **Co-locate by feature** | Komponen spesifik satu halaman → letakkan di folder halaman itu, bukan di `components/` |
| **`components/` hanya untuk shared** | Komponen yang dipakai ≥2 halaman berbeda |
| **`lib/` bukan `utils/`** | Semua helper, hook, store, dan client singleton masuk `lib/` |
| **Jangan buat folder baru di root** | Tanpa persetujuan eksplisit user |
| **Hindari barrel re-exports** | Impor langsung dari file sumbernya (`@/lib/store/gameStore`) |

---

## 3. Stack & Tools — Cara Penggunaan

### 3.1 Next.js 16 (App Router)

```ts
// ✅ Route Handler (API)
// app/api/game/sessions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  // ... logic
  return NextResponse.json({ data }, { status: 201 })
}

// ✅ Server Component (fetch data langsung)
// app/guru/page.tsx
import prisma from '@/lib/prisma'

export default async function GuruPage() {
  const classrooms = await prisma.classroom.findMany()
  return <Dashboard classrooms={classrooms} />
}
```

- Baca `node_modules/next/dist/docs/` sebelum menggunakan fitur baru.
- Gunakan `dynamic` import untuk komponen berat di client.
- Metadata halaman wajib didefinisikan via `export const metadata` di Server Component.

### 3.2 Prisma 5 + PostgreSQL (Supabase)

```ts
// lib/prisma.ts — SUDAH ADA, jangan buat ulang
import { PrismaClient } from '@/src/generated/prisma'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
export default prisma
```

**Aturan Prisma:**
- Import dari `@/src/generated/prisma` (bukan `@prisma/client` langsung — output dikustomisasi).
- **Jangan pernah jalankan query Prisma di Client Component** — hanya di Server Component atau Route Handler.
- Setelah mengubah `schema.prisma` → jalankan `npx prisma generate`.
- Gunakan `@@map` untuk semua model (snake_case di DB, PascalCase di Prisma).

### 3.3 Supabase (Realtime & Browser)

```ts
// lib/supabase.ts — SUDAH ADA, jangan buat ulang
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(url, key, {
  realtime: { params: { eventsPerSecond: 20 } }
})
```

**Kapan pakai Supabase vs Prisma:**

| Kebutuhan | Gunakan |
|-----------|---------|
| Realtime (broadcast, presence) | `supabase` dari `@/lib/supabase` |
| Baca/tulis database dari server | `prisma` dari `@/lib/prisma` |
| Baca database dari browser | **Dilarang** — buat Route Handler, panggil via `fetch` |

**Pola Realtime (Broadcast):**
```ts
// Selalu gunakan hook useGameRealtime — jangan buat channel sendiri di komponen
import { useGameRealtime } from '@/lib/hooks/useGameRealtime'

const { broadcastPos, broadcastStep } = useGameRealtime(teamId, studentId, name)
```

- Batas: 20 broadcast events/detik per client.
- Selalu `channel.unsubscribe()` di cleanup `useEffect`.
- Gunakan `self: false` di config channel agar tidak echo event sendiri.

### 3.4 Zustand 5

```ts
// Pola baku store — lihat lib/store/gameStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MyStore {
  // State
  value: string
  // Actions (di interface yang sama)
  setValue: (v: string) => void
}

export const useMyStore = create<MyStore>()(
  persist(
    (set) => ({
      value: '',
      setValue: (v) => set({ value: v }),
    }),
    {
      name: 'ar-cognistats-[nama]',   // key localStorage
      partialize: (state) => ({ value: state.value }), // hanya persist yang perlu
    }
  )
)
```

**Aturan Zustand:**
- Satu file store = satu domain (game, auth, dll.).
- Tempatkan di `lib/store/`.
- Jangan gunakan `get()` di dalam action kecuali benar-benar perlu — prefer `set((state) => ...)`.
- Tambahkan `'use client'` di baris pertama setiap file store.
- Gunakan `partialize` untuk mengontrol apa yang dipersist ke localStorage.

### 3.5 Framer Motion

```tsx
// Gunakan untuk animasi UI — import dari 'framer-motion'
import { motion, AnimatePresence } from 'framer-motion'

// Pola standar
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3, ease: 'easeOut' }}
>
```

- Gunakan `AnimatePresence` untuk animasi mount/unmount.
- Jangan animasi properti yang memicu layout (width, height) — prefer `transform` dan `opacity`.
- Untuk list item animasi, gunakan `layout` prop + `layoutId`.

### 3.6 DnD Kit

```tsx
import { DndContext, useSortable } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
// Digunakan untuk drag-and-drop interaktif di game/worksheet
```

- Hanya digunakan di Client Components (`'use client'`).
- Selalu definisikan `sensors` dengan `useSensors` untuk aksesibilitas keyboard.

### 3.7 Tailwind CSS v4

- **Tidak ada `tailwind.config.js`** di v4 — konfigurasi via CSS di `app/globals.css`.
- Gunakan CSS custom properties (`--color-primary`, dll.) untuk design tokens.
- Jangan gunakan `@apply` secara berlebihan — prefer utility classes langsung.

---

## 4. Konvensi Kode TypeScript

### 4.1 Typing

```ts
// ✅ Selalu type explicit untuk props komponen
interface Props {
  studentId: string
  onComplete: (score: number) => void
}

// ✅ Gunakan type untuk union/intersection, interface untuk object shapes
type CognitiveStyle = 'FI' | 'FD'
type GamePhase = 'cutscene_comments' | 'playing' | 'completed'

// ❌ Jangan pernah gunakan `any`
// const data: any = ...   <- DILARANG

// ✅ Gunakan `unknown` + type guard
const data: unknown = response
if (typeof data === 'string') { /* safe */ }
```

### 4.2 Async & Error Handling

```ts
// ✅ Route Handler — selalu tangani error
export async function GET(req: NextRequest) {
  try {
    const data = await prisma.student.findMany()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API] students GET error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
```

### 4.3 Komponen React

```tsx
// ✅ Server Component (default)
export default async function Page() { ... }

// ✅ Client Component — hanya jika perlu
'use client'
export default function InteractiveWidget() { ... }

// ✅ Props dengan React.FC tidak diperlukan — gunakan function declaration
function MyComponent({ title }: { title: string }) { ... }

// ✅ Memo hanya jika ada bukti re-render berlebihan
const MemoComp = React.memo(MyComponent)
```

### 4.4 Import Path

```ts
// ✅ Selalu gunakan alias @/
import prisma from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { useGameStore } from '@/lib/store/gameStore'

// ❌ Jangan relative path yang dalam
// import prisma from '../../../../lib/prisma'
```

---

## 5. Skema Database — Panduan Cepat

Model utama di `prisma/schema.prisma`:

| Model | Fungsi |
|-------|--------|
| `Classroom` | Kelas (X MIPA 1, dll.) |
| `Student` | Siswa dengan NISN, status GEFT, skor diagnostik |
| `GeftResult` | Hasil tes GEFT → `CognitiveStyle` (FI/FD) |
| `GameSession` | Satu sesi game per siswa per level |
| `Leaderboard` | Total XP & badge per siswa |
| `Team` | Tim kolaborasi FD per kelas per level |
| `TeamMember` | Anggota tim |
| `TeamMessage` | Chat dalam tim |
| `ChatbotKnowledge` | Knowledge base chatbot |
| `ModulAjar` | Modul ajar yang bisa dibuat guru |

**Aturan skema:**
- Semua ID menggunakan `uuid()`.
- Semua kolom snake_case di DB (`@map`), PascalCase di Prisma.
- Gunakan `DateTime @updatedAt` untuk kolom `updatedAt`.

---

## 6. Pola API Route Handler

```
app/api/
├── game/
│   ├── sessions/route.ts        → POST /api/game/sessions
│   ├── leaderboard/route.ts     → GET  /api/game/leaderboard
│   └── team/route.ts            → GET, POST, PATCH /api/game/team
├── students/route.ts            → GET, POST /api/students
└── guru/route.ts                → GET /api/guru
```

**Template Route Handler:**

```ts
// app/api/[domain]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    const data = await prisma.student.findMany({
      where: { id: id ?? undefined },
    })
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API] GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

---

## 7. Perintah Penting

```bash
# Development
npm run dev                  # Start dev server

# Database
npx prisma generate          # WAJIB setelah ubah schema.prisma
npx prisma db push           # Push skema ke DB (hati-hati di prod)
npx prisma studio            # GUI database

# Linting
npm run lint                 # ESLint check

# Build (hanya untuk validasi)
npm run build                # prisma generate + next build
```

---

## 8. Apa yang JANGAN Dilakukan

| Jangan | Lakukan sebagai gantinya |
|--------|--------------------------|
| Import `@prisma/client` langsung | Import dari `@/src/generated/prisma` via `@/lib/prisma` |
| Query database di Client Component | Buat Route Handler, panggil via `fetch` |
| Buat Supabase channel baru di komponen | Gunakan hook `useGameRealtime` |
| Gunakan `any` di TypeScript | Gunakan `unknown` + type guard, atau type yang tepat |
| Buat file gambar di root project | Letakkan di `public/` |
| Edit file di `src/generated/` | Auto-generated, jangan sentuh |
| Gunakan `useEffect` untuk fetch di Server Component | Server Components bisa `async` langsung |
| Buat store Zustand di luar `lib/store/` | Selalu di `lib/store/` |
| Hard-code environment variable | Gunakan `process.env.NAMA_VAR` |
| Commit `.env` ke git | `.env` sudah ada di `.gitignore` |

---

## 9. Environment Variables

```bash
# .env (tidak di-commit)
DATABASE_URL=                  # Prisma connection pool (Supabase pooler)
DIRECT_URL=                    # Direct DB connection (untuk migrations)
NEXT_PUBLIC_SUPABASE_URL=      # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Supabase anonymous key (browser-safe)
```

- Variabel `NEXT_PUBLIC_*` aman untuk browser — nilainya ter-bundle ke client.
- Variabel tanpa prefix hanya tersedia di server (Route Handler, Server Component).

---

## 10. Checklist Sebelum Selesai

Sebelum selesai mengerjakan task, pastikan:

- [ ] Tidak ada `any` baru yang ditambahkan
- [ ] Server Component tidak mengimpor `'use client'` module tanpa alasan
- [ ] Route Handler baru sudah punya try/catch
- [ ] File baru ditempatkan di folder yang sesuai (lihat §2)
- [ ] Import menggunakan alias `@/` bukan relative path dalam
- [ ] Komponen Supabase realtime baru menggunakan `useGameRealtime`, bukan channel manual
- [ ] Perubahan skema Prisma sudah diikuti instruksi `npx prisma generate`
- [ ] Tidak ada magic string untuk status/enum — gunakan union type atau Prisma enum
