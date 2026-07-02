import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const SEED_MODUL_CONTENT = {
  identifikasi: {
    kemampuanAwal: {
      tinggi: "—",
      sedang: "—",
      rendah: "—"
    },
    geft: {
      fi: "—",
      fd: "—"
    },
    deskripsi: "Kesiapan belajar, minat, gaya kognitif, dan kemampuan literasi digital menjadi dasar pengelompokkan dan diferensiasi pembelajaran pada platform SKEPTIKOS yang kedepannya menjadi wadah bagi setiap siswa untuk menumbuhkan dimensi profil lulusan."
  },
  materiPelajaran: {
    definisi: "Statistika adalah cabang matematika yang mempelajari cara mengumpulkan, menyajikan, dan menganalisis data.",
    materiPokok: {
      judul: "Tabel Distribusi Frekuensi",
      deskripsi: "Salah satu penyajian statistik data berkelompok dalam bentuk tabel, dimana data dikelompokkan ke dalam kelas-kelas interval dengan masing-masing interval mempunyai jumlah data/ frekuensi.",
      langkah: [
        "mengurutkan data dari nilai terkecil hingga terbesar",
        "menentukan jangkauan/ rentang (R) = nilai terbesar – nilai terkecil",
        "menentukan banyak kelas (K) = 1 + 3,3 log n (n = banyaknya data)",
        "menentukan panjang kelas (P) = R/K",
        "menetapkan nilai data pada interval kelas dan menentukan frekuensi tiap kelas"
      ]
    },
    histogram: {
      judul: "Histogram",
      deskripsi: "Histogram adalah jenis grafik yang menampilkan distribusi frekuensi dari suatu variabel numerik. Setiap batang pada histogram mencakup tentang nilai tertentu dikenal dengan kelas, dan tinggi batang menunjukkan frekuensi data dalam rentang data tersebut."
    },
    sumber: [
      { nama: "Buku matematika kelas X" },
      { nama: "Website SKEPTIKOS", url: "https://statistika-two.vercel.app" },
      { nama: "Youtube", url: "https://youtu.be/UqWLcTirNjU?si=LaGsQNpzwmRN-BLJ" }
    ]
  },
  dpl: [
    "DPL 3: Penalaran Kritis",
    "DPL 4: Kreativitas",
    "DPL 5: Kolaborasi",
    "DPL 6: Kemandirian",
    "DPL 8: Komunikasi"
  ],
  desainPembelajaran: {
    capaian: "Di akhir fase E, peserta didik dapat menyajikan dan menganalisis data statistika dalam bentuk tabel distribusi frekuensi dan histogram, serta menginterpretasikan informasi yang terkandung di dalamnya untuk mendukung kemampuan literasi digital.",
    lintasDisiplin: {
      ipa: "Menggunakan data hasil eksperimen atau pengamatan lingkungan dapat diubah menjadi diagram untuk interpretasi yang lebih jelas.",
      ips: "Menggunakan diagram untuk menampilkan data demografis, ekonomi, atau sosial secara informatif.",
      informatika: "Menyajikan data dengan grafik menjadi bagian penting dalam pengenalan dasar analisis data.",
      bahasaIndonesia: "Menerapkan keterampilan membaca dan menafsirkan grafik dapat diasah dalam konteks teks nonfiksi."
    },
    tujuan: [
      "Membedakan berbagai macam jenis data serta membuat grafik yang sesuai dan merepresentasikan data tersebut, serta melakukan analisis data untuk pengambilan keputusan.",
      "Menggambar dan mengintegrasikan histogram.",
      "Menganalisis dan menginterpretasikan informasi dari tabel distribusi frekuensi dan histogram dalam konteks literasi digital."
    ],
    topik: [
      "Mempresentasikan data dalam bentuk tabel distribusi frekuensi.",
      "Mempresentasikan data dalam bentuk histogram.",
      "Menyelesaikan investigasi data berbasis game melalui platform SKEPTIKOS level 1."
    ],
    praktikPedagogis: {
      model: "Problem-Based Learning (PBL)",
      pendekatan: "Pembelajaran Berdiferensiasi berbasis Deep Learning",
      metode: "Game Based Learning (GBL), Diskusi",
      pembelajaranBerkesadaran: "Melalui kegiatan refleksi dan pertanyaan pancingan sebuah postingan pada level 1, peserta didik diajak untuk menyadari proses berpikir mereka, mengenali kesulitan, dan bagaimana mereka mengatasinya sehingga fokus.",
      pembelajaranBermakna: "Materi dikaitkan dengan kehidupan nyata tentang sebuah postingan yang ada di media sosial, hubungan antar konsep, dan masalah relevan yang memicu rasa ingin tahu.",
      pembelajaranMenggembirakan: "Game SKEPTIKOS dikemas dalam sebuah investigasi data dengan narasi detektif Dira yang menyenangkan, sehingga siswa berkontribusi dalam membangun konsep dan menyelesaikan masalah."
    },
    kemitraan: [
      "Lingkungan Sekolah: Guru mata pelajaran lain",
      "Lingkungan Luar Sekolah: Komunitas sekitar yang dapat memberikan contoh data literasi digital",
      "Masyarakat: Melalui studi kasus dari media massa atau internet yang menunjukkan pentingnya kemampuan literasi digital"
    ],
    lingkungan: {
      ruangFisik: "Ruang Fisik: Kelas atau Laboratorium dengan perangkat (laptop/HP)",
      ruangVirtual: "Ruang Virtual: Platform SKEPTIKOS",
      budayaBelajar: "Budaya Belajar: Menghargai cara berpikir (FI/FD) sebagai kekayaan perspektif."
    },
    pemanfaatanDigital: "Platform SKEPTIKOS"
  },
  pengalamanBelajar: {
    awal: {
      pembukaan: [
        "Guru membuka pelajaran dengan salam, doa bersama menyapa peserta didik dengan ramah, memeriksa kehadiran, dan mengajak peserta didik untuk menenangkan diri sejenak (misalnya, dengan tarik napas dalam-dalam) untuk mempersiapkan pikiran belajar.",
        "Guru meminta peserta didik untuk mengerjakan tes diagnostik yang ada pada platform SKEPTIKOS.",
        "Guru meminta peserta didik untuk mengikuti tes GEFT untuk mengetahui gaya kognitif peserta didik (FI/FD) pada platform SKEPTIKOS.",
        "Guru memisahkan peserta didik berdasarkan gaya kognitifnya. FI bekerja secara mandiri dan FD bekerja secara berpasangan."
      ],
      apersepsi: [
        "Guru menyampaikan tujuan pembelajaran hari ini.",
        "Guru mengajukan pertanyaan pemantik yang mengaitkan materi dengan kehidupan sehari-hari atau pengalaman peserta didik. Misalnya:",
        "Pernahkah kalian melihat berita atau postingan tentang masalah pendidikan, kesehatan, politik namun tidak tahu persis apakah data tersebut valid atau tidak?",
        "Bagaimana pendapat kalian jika seseorang memberikan komentar yang tidak baik di sosial media, padahal berita yang ia baca tidak valid?",
        "Setiap informasi yang dipublikasi haruslah dari data yang valid, apa saja bentuk penyajian data yang kamu tau?",
        "Jika kalian punya data nilai ulangan seluruh kelas, bagaimana cara menyajikannya agar mudah dipahami semua orang?"
      ],
      motivasi: [
        "Guru menampilkan video singkat kenapa kemampuan literasi digital sangat penting di era modern: https://youtu.be/3uLLivFGlfE?si=z6Bc9lIuDyMNA37W"
      ],
      iceBreaking: [
        "Permainan singkat atau teka-teki untuk membangun suasana positif.",
        "Menyampaikan tujuan pembelajaran dan penilaian."
      ]
    },
    inti: {
      memahami: {
        sintaks1: {
          judul: "Orientasi peserta didik pada masalah (Sintaks 1 PBL)",
          langkah: [
            "Guru meminta siswa membuka game level 1 pada SKEPTIKOS.",
            "Guru menyampaikan bahwa peserta didik berperan sebagai detektif saat bermain game dan menyimpulkan apakah postingan tersebut valid atau tidak berdasarkan penyajian data pada histogram."
          ],
          diferensiasi: [
            "FI : Mandiri",
            "FD : Diskusi dengan pasangan kelompok"
          ]
        }
      },
      mengaplikasi: {
        sintaks2: {
          judul: "Mengorganisasikan Peserta didik dalam belajar (Sintaks 2 PBL)",
          langkah: [
            "Guru meminta peserta didik untuk membuka materi pembelajaran pada platform SKEPTIKOS."
          ],
          diferensiasi: [
            "FI : Membaca Buku Saku secara mandiri",
            "FD : Menonton video pembelajaran secara berpasangan"
          ]
        },
        sintaks3: {
          judul: "Membimbing penyelidikan (Sintaks 3 PBL)",
          langkah: [
            "Peserta didik mengerjakan Aktivitas 1 dan Aktivitas 2 pada E-LKPD (kreatif).",
            "Peserta didik menyelesaikan soal-soal tersebut, saling berbagi ide dan memvalidasi jawaban. (berpikir kritis)",
            "Guru berkeliling melakukan bimbingan kepada kelompok yang mengalami kesulitan dan memberikan arahan untuk mengerjakan E-LKPD."
          ],
          diferensiasi: [
            "FI : Mandiri",
            "FD : Diskusi dengan pasangan kelompok (kolaborasi)"
          ]
        },
        sintaks4: {
          judul: "Mengembangkan dan menyajikan hasil karya (Sintaks 4 PBL)",
          langkah: [
            "Guru meminta perwakilan FI dan kelompok FD untuk mempresentasikan hasil diskusi dan penyelesaian soal mereka. (Komunikasi)"
          ]
        }
      },
      menganalisis: {
        sintaks5: {
          judul: "Menganalisis dan mengevaluasi (Sintaks 5 PBL)",
          langkah: [
            "Guru memfasilitasi diskusi kelas untuk menganalisis hasil penyelidikan dan mengevaluasi kesimpulan tentang konsep-konsep kunci yang telah dipelajari."
          ]
        }
      }
    },
    penutup: [
      "Guru dan peserta didik menyimpulkan pembelajaran dan menekankan hubungan materi statistika dengan kemampuan literasi digital dan etika media sosial dalam kehidupan sehari-hari.",
      "Guru mengajukan pertanyaan refleksi: \"Apa hal baru yang kalian pelajari hari ini?\" dan \"Apakah ada bagian yang masih membingungkan?\"",
      "Guru meminta siswa mengerjakan tes sumatif pada platform SKEPTIKOS.",
      "Guru menginformasikan materi pada pertemuan selanjutnya yaitu ukuran pemusatan data.",
      "Pembelajaran diakhiri dengan penyampaian pesan moral: “Kemampuan kalian membaca data membuat kalian menjadi orang yang literat secara digital. Namun, kepintaran itu akan sia-sia jika tidak dibarengi dengan etika di media sosial. Statistik bisa dimanipulasi untuk mengiring opini, tetapi nurani kalian tidak boleh ikut teramanipulasi. Gunakan media sosial untuk menyebarkan kebenaran, bukan hoaks. Latihlah diri kalian untuk berpikir kritis sebelum berbicara atau berkomentar di dunia maya.”",
      "Guru mengakhiri pembelajaran dengan salam."
    ]
  }
}

/**
 * GET: Fetch all Modul Ajar
 * If empty, automatically seeds the first module (PDF)
 */
export async function GET(req: NextRequest) {
  try {
    let items = await prisma.modulAjar.findMany({
      orderBy: { createdAt: 'asc' }
    })

    // Auto-seed if empty
    if (items.length === 0) {
      const seededItem = await prisma.modulAjar.create({
        data: {
          title: "Tabel Distribusi Frekuensi dan Histogram",
          subject: "Matematika",
          grade: "E / X",
          topic: "Tabel Distribusi Frekuensi dan Histogram",
          duration: "2 x 45 Menit",
          session: "Pertama",
          content: JSON.stringify(SEED_MODUL_CONTENT)
        }
      })
      items = [seededItem]
    }

    return NextResponse.json(items)
  } catch (error: any) {
    console.error('Fetch Modul Ajar error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data modul ajar' }, { status: 500 })
  }
}

/**
 * POST: Create a new Modul Ajar (for super admin / future expansion)
 */
export async function POST(req: NextRequest) {
  try {
    const { title, subject, grade, topic, duration, session, content } = await req.json()

    if (!title || !topic || !content) {
      return NextResponse.json({ error: 'Judul, topik, dan konten wajib diisi' }, { status: 400 })
    }

    const newItem = await prisma.modulAjar.create({
      data: {
        title: title.trim(),
        subject: subject || 'Matematika',
        grade: grade || 'E / X',
        topic: topic.trim(),
        duration: duration || '2 x 45 Menit',
        session: session || 'Pertama',
        content: typeof content === 'string' ? content : JSON.stringify(content)
      }
    })

    return NextResponse.json(newItem)
  } catch (error: any) {
    console.error('Create Modul Ajar error:', error)
    return NextResponse.json({ error: 'Gagal menambah data modul ajar' }, { status: 500 })
  }
}

/**
 * DELETE: Remove a Modul Ajar
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan untuk menghapus modul' }, { status: 400 })
    }

    await prisma.modulAjar.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Modul berhasil dihapus' })
  } catch (error: any) {
    console.error('Delete Modul Ajar error:', error)
    return NextResponse.json({ error: 'Gagal menghapus data modul ajar' }, { status: 500 })
  }
}
