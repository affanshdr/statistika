import { NextRequest, NextResponse } from 'next/server'
import { searchKnowledge } from '@/lib/chatbot/search'



/**
 * Local Rule-based Generator for Demo Mode
 */
function generateDemoResponse(query: string, context: any[], profile: any): string {
  const name = profile?.name || 'Detektif'
  const style = profile?.cognitiveStyle || 'FD'
  const level = profile?.currentLevel || 1
  const isFD = style === 'FD'

  const lowerQuery = query.toLowerCase()

  let intro = ''
  if (isFD) {
    intro = `Halo ${name}! 🕵️‍♂️ DiRA di sini. Sebagai asisten belajarmu, aku senang bisa membantumu! `
  } else {
    intro = `Halo ${name}. Analisis profil kognitif menunjukkan gaya belajarmu adalah Field Independent (FI). Berikut adalah poin-poin analisis yang bisa kamu pelajari secara mandiri: `
  }

  let body = ''
  
  if (lowerQuery.includes('mean') || lowerQuery.includes('rata-rata')) {
    body = `**Konsep Mean (Rata-rata) Data Kelompok**:\n\n` +
      `Mean data kelompok dihitung dengan mengalikan frekuensi masing-masing kelas dengan nilai tengahnya, lalu dibagi dengan jumlah total data. Rumusnya:\n` +
      `$$\\bar{x} = \\frac{\\sum (f_i \\times x_i)}{\\sum f_i}$$\n\n` +
      `Di mana:\n` +
      `- $f_i$ = frekuensi kelas ke-$i$\n` +
      `- $x_i$ = nilai tengah interval kelas ke-$i$, dihitung dari $\\frac{\\text{batas bawah} + \\text{batas atas}}{2}$.\n\n` +
      (isFD 
        ? `Cobalah hitung nilai tengah masing-masing interval di tabel modulmu terlebih dahulu, lalu kalikan dengan frekuensinya satu per satu ya! 😉`
        : `Lakukan perkalian $f_i \\times x_i$ untuk setiap baris kelas, jumlahkan semuanya, lalu bagi dengan total sampel $N$.`);
  } else if (lowerQuery.includes('median') || lowerQuery.includes('nilai tengah')) {
    body = `**Konsep Median (Nilai Tengah) Data Kelompok**:\n\n` +
      `Median data kelompok adalah nilai tengah data setelah diurutkan. Rumus median data kelompok:\n` +
      `$$Me = L + \\left(\\frac{\\frac{N}{2} - F_k}{f_m}\\right) \\times c$$\n\n` +
      `Langkah pengerjaannya:\n` +
      `1. Tentukan letak median yaitu pada data ke-$N/2$.\n` +
      `2. Cari interval kelas mana yang memuat data ke-$N/2$ tersebut.\n` +
      `3. Dapatkan nilai:\n` +
      `   - $L$ = Tepi bawah kelas median (Batas bawah - 0.5)\n` +
      `   - $F_k$ = Frekuensi kumulatif sebelum kelas median\n` +
      `   - $f_m$ = Frekuensi kelas median itu sendiri\n` +
      `   - $c$ = Lebar interval kelas\n\n` +
      (isFD 
        ? `Yuk kita coba identifikasi satu per satu komponen di atas berdasarkan tabel tinggi badan di sebelah kiri! Tanyakan padaku bagian mana yang membuatmu bingung.`
        : `Substitusikan parameter-parameter tersebut secara analitis untuk memperoleh nilai tengah distribusi.`);
  } else if (lowerQuery.includes('modus') || lowerQuery.includes('paling banyak') || lowerQuery.includes('terbanyak')) {
    body = `**Konsep Modus Data Kelompok**:\n\n` +
      `Modus adalah nilai yang paling sering muncul. Pada data kelompok, modus dicari pada kelas interval dengan frekuensi tertinggi. Rumusnya:\n` +
      `$$Mo = L + \\left(\\frac{d_1}{d_1 + d_2}\\right) \\times c$$\n\n` +
      `Di mana:\n` +
      `- $L$ = Tepi bawah kelas modus (batas bawah kelas dengan frekuensi tertinggi dikurangi 0.5)\n` +
      `- $d_1$ = Selisih frekuensi kelas modus dengan kelas sebelumnya ($f_{\\text{modus}} - f_{\\text{sebelumnya}}$)\n` +
      `- $d_2$ = Selisih frekuensi kelas modus dengan kelas sesudahnya ($f_{\\text{modus}} - f_{\\text{sesudahnya}}$)\n` +
      `- $c$ = Lebar interval kelas\n\n` +
      (isFD
        ? `Di grafik histogram 3D, carilah balok yang paling tinggi! Kelas itulah yang menjadi kelas Modus. Selisih tinggi balok itu dengan balok kiri adalah $d_1$, dan dengan balok kanan adalah $d_2$. Gampang kan? 😄`
        : `Tentukan kelas berfrekuensi maksimum secara visual dari grafik, hitung gradien perbedaan frekuensi dengan kelas tetangganya ($d_1$ dan $d_2$), lalu masukkan ke rumus.`);
  } else if (lowerQuery.includes('histogram') || lowerQuery.includes('grafik') || lowerQuery.includes('sebaran') || lowerQuery.includes('distribusi')) {
    body = `**Histogram & Distribusi Sebaran Data**:\n\n` +
      `Histogram menyajikan frekuensi data secara visual dalam bentuk grafik batang tegak saling berhimpit.\n` +
      `- **Menceng Kanan (Positif)**: Memiliki ekor memanjang ke arah kanan. Hal ini terjadi karena adanya outlier atau pencilan bernilai tinggi di sebelah kanan. Rata-rata (Mean) akan tertarik ke kanan sehingga Mean > Median > Modus.\n` +
      `- **Menceng Kiri (Negatif)**: Memiliki ekor memanjang ke kiri. Nilai Mean < Median < Modus.\n` +
      `- **Simetris**: Berbentuk seperti lonceng setimbang. Nilai Mean ≈ Median ≈ Modus.\n\n` +
      `Di Level 1, data screen time siswa SMA Harapan ternyata menceng kanan. Ini membuktikan bahwa rata-rata ditarik naik oleh 2 orang siswa dengan screen time ekstrim (17 & 18 jam), meskipun mayoritas siswa bermain di bawah 8 jam!`;
  } else if (lowerQuery.includes('outlier') || lowerQuery.includes('pencilan')) {
    body = `**Outlier (Pencilan Data)**:\n\n` +
      `Outlier adalah titik data yang sangat jauh dari pola umum data lainnya.\n` +
      `- Dampak utama: Outlier sangat memengaruhi **Mean** (karena semua angka dijumlahkan), tetapi **Median** (nilai tengah) tetap stabil.\n` +
      `- Contoh di game: Ada 35 data screen time, 33 di antaranya berkisar antara 1-12 jam, tetapi ada 2 siswa dengan 17 dan 18 jam. Angka 17 dan 18 adalah outlier.\n` +
      `- Karena ada outlier ekstrim ini, nilai Mean tertarik naik menjadi 7.06 jam. Namun, Median (6.67 jam) dan Modus (6.38 jam) memberikan gambaran tengah yang lebih adil bagi mayoritas siswa.`;
  } else if (lowerQuery.includes('level') || lowerQuery.includes('game') || lowerQuery.includes('misi') || lowerQuery.includes('main')) {
    body = `**Misi Game Skeptikos Level 1**:\n\n` +
      `Misi kamu saat ini di Level 1 berlokasi di Sekolah Harapan.\n` +
      `Kamu ditugaskan untuk menyelidiki kebenaran postingan viral yang mengeklaim rata-rata screen time siswa >8 jam per hari.\n` +
      `Langkah:\n` +
      `1. Tarik (drag) data 26 siswa yang tersisa ke kolom kelas histogram yang sesuai.\n` +
      `2. Setelah selesai, hitung nilai Mean, Median, dan Modusnya.\n` +
      `3. Berikan vonis (verdict). Nilai Mean yang sesungguhnya adalah 7.06 jam. Jadi, klaim viral itu adalah **SALAH** (Tidak didukung data).\n\n` +
      (isFD
        ? `Jangan khawatir, ikuti petunjuk DiRA di layar secara perlahan ya! Aku akan membantumu di setiap langkah. 😉`
        : `Analisis data secara teliti dan buat kesimpulan logis dari sebaran histogram.`);
  } else if (lowerQuery.includes('fi') || lowerQuery.includes('field independent')) {
    body = `**Gaya Belajar Field Independent (FI)**:\n\n` +
      `Kamu memiliki gaya kognitif Field Independent. Profil ini menunjukkan kemampuan luar biasa dalam menganalisis bagian-bagian penyusun dari suatu gambar/masalah kompleks secara terpisah.\n` +
      `- Kamu menyukai tantangan logis, penyelesaian mandiri, dan ringkasan rumus formal.\n` +
      `- Di game, kamu diberikan kebebasan penuh tanpa asisten visual yang terus-menerus muncul, agar kamu bisa menguji hipotesismu sendiri. Sukses dalam penyelidikan mandirimu! 🔍`;
  } else if (lowerQuery.includes('fd') || lowerQuery.includes('field dependent')) {
    body = `**Gaya Belajar Field Dependent (FD)**:\n\n` +
      `Kamu memiliki gaya kognitif Field Dependent. Profil ini menunjukkan bahwa kamu belajar secara optimal dalam konteks global, menyukai hubungan interpersonal, dan terbimbing dengan baik.\n` +
      `- Kamu menyukai contoh kehidupan sehari-hari, petunjuk visual (scaffold), dan interaksi tutor.\n` +
      `- Di game, aku (DiRA) bertindak sebagai rekan setiamu untuk memandu pemecahan histogram, memberikan petunjuk jika salah letak, dan menjelaskan makna statistika secara bertahap. Semangat! 👥`;
  } else {
    // Generate context based answer if items were found
    if (context.length > 0) {
      body = `Berdasarkan referensi materi:\n\n` + 
        context.map(c => `### ${c.title}\n${c.content}`).join('\n\n') +
        `\n\nAda bagian materi tersebut yang ingin kamu tanyakan lebih detail?`;
    } else {
      body = `Halo! Saya DiRA, asisten belajarmu. Saya siap membantumu memahami materi **Statistika Deskriptif** (seperti Mean, Median, Modus data kelompok, Histogram, Outlier) atau memberikan panduan mengenai **Game Skeptikos**.\n\n` +
        `Silakan ajukan pertanyaan seputar:\n` +
        `- Cara mencari Mean, Median, atau Modus data kelompok\n` +
        `- Apa itu sebaran data menceng kanan atau kiri\n` +
        `- Pengaruh data pencilan (outlier) terhadap rata-rata\n` +
        `- Panduan menyelesaikan level investigasi\n\n` +
        `Apa yang ingin kamu pelajari hari ini?`;
    }
  }

  const footer = `\n\n---\n*🤖 Chatbot berjalan dalam **Mode Demo** (lokal) karena API Key Gemini belum dikonfigurasi di server.*`
  return intro + '\n\n' + body + footer
}

export async function POST(req: NextRequest) {
  try {
    const { messages, studentProfile } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]
    const query = lastMessage.content

    // Retrieve knowledge articles using RAG keyword search
    const contextResults = await searchKnowledge(query, 3)

    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY_3

    // If Gemini API Key is missing, run in Demo Mode with beautiful rule-based generation
    if (!apiKey) {
      const demoReply = generateDemoResponse(query, contextResults, studentProfile)
      return NextResponse.json({
        role: 'model',
        content: demoReply,
        isDemo: true
      })
    }

    // Prepare system instructions incorporating student profile and RAG context
    const studentName = studentProfile?.name || 'Siswa'
    const studentStyle = studentProfile?.cognitiveStyle || 'FD'
    const currentLevel = studentProfile?.currentLevel || 1
    const lives = studentProfile?.lives ?? 3
    const xp = studentProfile?.xp ?? 0
    const mistakes = studentProfile?.mistakeCount ?? 0

    const systemPrompt = `Kamu adalah DiRA, asisten AI tutor khusus materi Statistika Deskriptif yang ramah, pintar, dan interaktif di game edukasi "Skeptikos: Investigasi Data".
Tugas utama dan SATU-SATUNYA yang diperbolehkan bagi kamu adalah membantu siswa memahami konsep-konsep Statistika Deskriptif (Mean, Median, Modus data kelompok, Histogram, Distribusi/Sebaran Frekuensi, Outlier/Pencilan).

Berikut profil siswa yang sedang berbicara denganmu saat ini:
- Nama Siswa: ${studentName}
- Gaya Kognitif: ${studentStyle === 'FI' ? 'Field Independent (FI)' : 'Field Dependent (FD)'}
- Level Game Aktif: Level ${currentLevel}
- Status Game saat ini: Langkah ke-${studentProfile?.currentStep || 0}, Sisa Nyawa: ${lives}, XP: ${xp}, Jumlah Kesalahan: ${mistakes}

Gaya Bimbingan Berdasarkan Profil Kognitif Siswa:
1. Jika siswa berprofil Field Independent (FI):
   - Gunakan gaya bahasa yang analitis, logis, ringkas, dan formal.
   - Jangan memberikan jawaban akhir secara instan. Sebaliknya, tantang mereka dengan pertanyaan penuntun (socratic questioning) tentang konsep statistika terkait dan biarkan mereka memecahkan sendiri.
   - Fokus pada penjelasan matematis dan logis dari konsep statistika.
2. Jika siswa berprofil Field Dependent (FD):
   - Gunakan gaya bahasa yang hangat, penuh empati, ramah, dan sangat suportif.
   - Sapa nama siswa sesekali.
   - Berikan bimbingan bertahap (scaffolding), jelaskan langkah demi langkah dengan jelas, dan gunakan analogi/konteks dunia nyata yang relevan untuk menjelaskan konsep statistika.

Gunakan Dokumen Referensi berikut untuk menjawab pertanyaan siswa secara akurat (RAG Context):
${contextResults.length > 0 
  ? contextResults.map((c, i) => `[Dokumen ${i+1}]: Title: ${c.title}\nContent: ${c.content}`).join('\n\n') 
  : 'Tidak ada dokumen referensi spesifik yang cocok. Jawablah berdasarkan pengetahuan umum statistika deskriptif SMA.'
}

Aturan Penting Respon (CRITICAL RULES):
1. KAMU HANYA DIPERBOLEHKAN MENJAWAB PERTANYAAN TENTANG MATERI STATISTIKA DESKRIPTIF.
2. Jika siswa bertanya hal lain di luar materi statistika (seperti gameplay game Skeptikos, cara menyelesaikan level game, curhat, obrolan santai non-edukatif, pelajaran lain, coding, sains, dll.), tolaklah pertanyaan tersebut secara sopan namun tegas. Katakan bahwa kamu adalah asisten khusus materi Statistika Deskriptif dan tidak diperbolehkan menjawab pertanyaan lain. Arahkan mereka untuk kembali mendiskusikan materi statistika.
3. Jika siswa mengunggah gambar/tangkapan layar berupa postingan media sosial, artikel berita, atau infografis grafik yang memuat data statistik, bacalah tulisan di dalamnya (OCR) dan lakukan analisis kritis terhadap visual grafik atau klaim data tersebut (seperti sumbu y yang dimanipulasi, ketiadaan baseline, bias pencilan pada rata-rata, dll.) menggunakan teori statistika deskriptif SMA yang relevan.
4. Jawablah dalam Bahasa Indonesia yang baik dan sesuai dengan gaya belajar siswa.
5. Gunakan format markdown yang rapi. Untuk rumus matematika, gunakan tanda dolar tunggal $ untuk inline (contoh: $x̄$) atau ganda $$ untuk blok rumus terpisah agar mudah dibaca.`

    // Format messages history for Gemini API (supporting multimodal inlineData)
    const contents = messages.map((m: any) => {
      const parts: any[] = []
      
      if (m.image) {
        const match = m.image.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/)
        if (match) {
          parts.push({
            inlineData: {
              mimeType: match[1],
              data: match[2]
            }
          })
        }
      }
      
      parts.push({ text: m.content || '' })
      
      return {
        role: m.role === 'user' ? 'user' : 'model',
        parts: parts
      }
    })

    // Call Gemini API via fetch (lightweight & 100% reliable)
    // We use gemini-2.5-flash which is the standard fast & smart model
    let geminiOk = false
    let textReply = ''

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: contents,
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            }
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        textReply = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        if (textReply) geminiOk = true
      } else {
        const errText = await response.text()
        console.error('Gemini API Error:', response.status, errText)
      }
    } catch (geminiErr) {
      console.error('Gemini fetch error:', geminiErr)
    }

    // Fallback ke demo mode jika Gemini gagal
    if (!geminiOk) {
      const demoReply = generateDemoResponse(query, contextResults, studentProfile)
      return NextResponse.json({
        role: 'model',
        content: demoReply,
        isDemo: true
      })
    }

    return NextResponse.json({
      role: 'model',
      content: textReply,
      isDemo: false
    })

  } catch (error: any) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server chatbot.', details: error.message },
      { status: 500 }
    )
  }
}
