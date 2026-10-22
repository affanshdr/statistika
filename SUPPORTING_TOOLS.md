# Supporting Tools Used

> **Specification**: A comprehensive list of all software, engine(s), asset creation tools, and libraries used throughout the design, development, testing, and deployment of **Stat-Casecode (AR-CogniStats)**, specifying whether each tool is **Paid (Premium)** or **Open-Source**.

---

## 1. Summary Overview Table

| Category | Tool / Library / Software | Role / Purpose in Project | License & Cost Model |
| :--- | :--- | :--- | :--- |
| **Engine / Framework** | **Next.js 16** | Core Web Application & Fullstack Game Engine (App Router, Turbopack, API Routes) | **Open-Source** (MIT License) |
| **Engine / Framework** | **React 19** | Component-based reactive UI rendering & game state lifecycle management | **Open-Source** (MIT License) |
| **Engine / Standard API**| **HTML5 Canvas & Web Audio API** | Native browser 2D rendering, collision handling, and SFX/BGM audio pipeline | **Open-Source** / Web Standard |
| **3D Engine / Graphics** | **Three.js** | 3D WebGL rendering engine for interactive 3D exploration and field scenes | **Open-Source** (MIT License) |
| **3D Engine / Graphics** | **@react-three/fiber & @react-three/drei** | Declarative React bindings for Three.js canvas & 3D camera/mesh helpers | **Open-Source** (MIT License) |
| **State Management** | **Zustand 5** | High-performance lightweight global game store (lives, score, stars, offline sync) | **Open-Source** (MIT License) |
| **UI & Styling** | **Tailwind CSS v4** | Utility-first CSS framework for retro-modern, responsive pixel-art UI layouts | **Open-Source** (MIT License) |
| **UI & Animations** | **Framer Motion 12** | Smooth character animations, dialog balloons, screen transitions, and popups | **Open-Source** (MIT License) |
| **Smooth Scrolling** | **Lenis** | Smooth scrolling engine for story booklets, tutorials, and pedagogical texts | **Open-Source** (MIT License) |
| **Iconography** | **Lucide React** | Clean, scalable vector iconography for HUD controls, navigation, and badges | **Open-Source** (ISC License) |
| **Visual Effects (VFX)** | **React Confetti** | Celebration particle physics effects upon stage clearance and level completion | **Open-Source** (MIT License) |
| **Database ORM** | **Prisma ORM 5** | Type-safe database client and schema migration for student & gameplay progress | **Open-Source** (Apache 2.0) |
| **Backend Runtime** | **Node.js** | Server-side JavaScript runtime powering build tasks, API endpoints, and scripts | **Open-Source** (MIT License) |
| **Database & Cloud** | **PostgreSQL (Supabase)** | Cloud relational database for persistent player progress, analytics, and sync | **Open-Source** Core / **Freemium** Cloud |
| **Cloud Client SDK** | **@supabase/supabase-js** | Official client SDK for cloud authentication and database interaction | **Open-Source** (MIT License) |
| **Generative Art AI** | **Google Imagen & Gemini AI** | Creation of nostalgic 32-bit pixel-art environment backgrounds & character concepts | **Paid / Commercial** (API Usage) |
| **2D Graphics & Editing**| **Adobe Photoshop / Figma** | UI mockups, sprite sheet slicing, green-screen chroma-keying, and asset export | **Paid** (Photoshop) / **Freemium** (Figma) |
| **Vector Illustration** | **Inkscape / Vector Tools** | Vector graphics creation (SVG) for cognitive Group Embedded Figures Test (GEFT) | **Open-Source** (GPL) |
| **Audio & Sound Design** | **Audacity** | Sound design, looping adjustments, audio normalization, and MP3/WAV export | **Open-Source** (GPL) |
| **Language & Compilers** | **TypeScript 5** | Strict static type-checking and enterprise-grade code maintainability | **Open-Source** (Apache 2.0) |
| **Code Quality** | **ESLint & eslint-config-next** | Automated code quality, static linting, and best-practice enforcement | **Open-Source** (MIT License) |
| **Automated Testing** | **Puppeteer** | Headless browser automation for visual regression testing and screenshot capture | **Open-Source** (Apache 2.0) |
| **Computer Vision / Math**| **Python (OpenCV & Pillow)** | Scripts for collision mask extraction, boundary tracing, and pixel coordinate audits | **Open-Source** (BSD / Apache 2.0) |
| **Deployment / CI/CD** | **Vercel** | Serverless production hosting, automatic edge builds, and global CDN delivery | **Freemium** (Free Hobby / Paid Pro) |
| **Version Control** | **Git & GitHub** | Distributed source code management, team collaboration, and CI/CD triggers | **Open-Source** (Git) / **Freemium** (GitHub) |

---

## 2. Detailed Breakdown by Domain

### A. Game Engine & Web Architecture
- **Next.js 16 & React 19 (Open-Source)**:
  Acts as the primary application engine and game loop controller. It delivers single-page zero-refresh transitions between the school courtyard, interactive classrooms, dialog cutscenes, and the statistical corkboard analysis workstation.
- **HTML5 Canvas & Web Audio API (Open-Source / Web Standard)**:
  Powers hardware-accelerated 2D rendering, interactive pixel-art character movement, dynamic bounding-box collisions, and low-latency audio playback for SFX and background melodies.
- **Three.js & React-Three Ecosystem (Open-Source)**:
  Employed for 3D field visualizations and interactive spatial mathematics simulations featured in Level 2.

### B. Asset Creation & Multimedia Production
- **Google Imagen & Gemini AI (Paid / Commercial Service)**:
  Utilized for generating rich, evocative 32-bit pixel-art architectural backdrops (inspired by *A Space for the Unbound*), including Ruang Kelas VII-A, VII-B, VIII-A, VIII-B, Ruang Guru, Selasar Fasilitas, and Gerbang Sekolah.
- **Adobe Photoshop & Figma (Paid / Freemium)**:
  Used for interface UI wireframing, color grading, sprite sheet composition, and background chroma-keying (removing solid green backgrounds to create transparent alpha sprites for Pak Sutrisno, Pak Bambang, Pak Joko, and cat companions).
- **Audacity (Open-Source)**:
  Used for mastering, trimming audio loop points, sample rate conversions, and volume balance for background music (`game_bgm.mp3`) and user interaction sound effects (`sfx_click`, `sfx_confirm`, `sfx_hover`, `sfx_cancel`).

### C. Backend, Cloud Database, & Offline Resilience
- **Prisma ORM & Supabase PostgreSQL (Open-Source / Freemium)**:
  Manages student session tracking, level progression, star ratings, and analytics. Features an automated offline synchronization queue (`playerSync.ts`) to ensure gameplay data is preserved locally when network connectivity is lost and flushed once reconnected.
- **Vercel Platform (Freemium)**:
  Handles cloud deployment, automatic SSL termination, and instant CDN asset caching for seamless browser gameplay across desktop and mobile devices.

### D. Quality Assurance & Engineering Utilities
- **Puppeteer & Python OpenCV (Open-Source)**:
  Employed during the engineering lifecycle for automated visual regression audits, responsive viewport verification (mobile vs. PC aspect ratios), and computer-vision-assisted collision detection.
