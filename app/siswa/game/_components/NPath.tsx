'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Maze constants ────────────────────────────────────────────────────────────
const CELL      = 11          // SVG units per cell
const COLS      = 26          // columns 0‥25
const ROWS      = 15          // rows    0‥14
const VW        = COLS * CELL // 286
const VH        = ROWS * CELL // 165
const ZONE_COL  = 20          // locked zones start here (cols 20‥24)
const SPEED     = 0.18
const DOOR_PROX = 16          // SVG units
const DATA_PROX = 6
const TOTAL_N   = 35

type DoorId = 'A' | 'B' | 'C'

// ─── Maze grid  (0=floor, 1=wall) ─────────────────────────────────────────────
// cols 0‥19 : main labyrinth
// cols 20‥24: locked data zones  (A=rows 1‑4, B=rows 6‑8, C=rows 10‑13)
// col  25   : right border
const MAZE: readonly (readonly number[])[] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // r0
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], // r1
  [1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1], // r2
  [1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // r3
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1], // r4
  [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1], // r5
  [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1], // r6
  [1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // r7
  [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1], // r8
  [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1], // r9
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1], // r10
  [1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1], // r11
  [1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1], // r12
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], // r13
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // r14
]

const CX = (c: number) => c * CELL + CELL / 2
const CY = (r: number) => r * CELL + CELL / 2

const DOORS = [
  { id:'A' as DoorId, label:'Pintu A', x: ZONE_COL*CELL, y: CY(3),
    color:'#818cf8', quizQ:'3 × 3 = ?', quizA:9,  hint:'3 dikali 3 sama dengan 9',  count:9  },
  { id:'B' as DoorId, label:'Pintu B', x: ZONE_COL*CELL, y: CY(7),
    color:'#fb923c', quizQ:'3 × 5 = ?', quizA:15, hint:'3 dikali 5 sama dengan 15', count:15 },
  { id:'C' as DoorId, label:'Pintu C', x: ZONE_COL*CELL, y: CY(11),
    color:'#f472b6', quizQ:'8 + 3 = ?', quizA:11, hint:'8 ditambah 3 sama dengan 11', count:11 },
] as const

const mk = (id: string, d: DoorId, col: number, row: number) =>
  ({ id, d, x: CX(col), y: CY(row) })

const DATA_CIRCLES = [
  // Zone A — 9
  mk('a1','A',21,1), mk('a2','A',22,1), mk('a3','A',23,1),
  mk('a4','A',20,2), mk('a5','A',22,2), mk('a6','A',24,2),
  mk('a7','A',21,3), mk('a8','A',23,3),
  mk('a9','A',22,4),
  // Zone B — 15
  mk('b1','B',20,6),  mk('b2','B',21,6),  mk('b3','B',22,6),  mk('b4','B',23,6),  mk('b5','B',24,6),
  mk('b6','B',20,7),  mk('b7','B',21,7),  mk('b8','B',22,7),  mk('b9','B',23,7),  mk('b10','B',24,7),
  mk('b11','B',20,8), mk('b12','B',21,8), mk('b13','B',22,8), mk('b14','B',23,8), mk('b15','B',24,8),
  // Zone C — 11
  mk('c1','C',21,10), mk('c2','C',22,10), mk('c3','C',23,10),
  mk('c4','C',20,11), mk('c5','C',22,11), mk('c6','C',24,11),
  mk('c7','C',21,12), mk('c8','C',23,12),
  mk('c9','C',20,13), mk('c10','C',22,13), mk('c11','C',24,13),
]

// ─── Walkability ──────────────────────────────────────────────────────────────
function isWalkable(sx: number, sy: number, unlocked: Set<DoorId>): boolean {
  const col = Math.floor(sx / CELL)
  const row = Math.floor(sy / CELL)
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false
  if ((MAZE[row]?.[col] ?? 1) === 1) return false
  if (col >= ZONE_COL && col < COLS - 1) {
    if (row >= 1  && row <= 4)  return unlocked.has('A')
    if (row >= 6  && row <= 8)  return unlocked.has('B')
    if (row >= 10 && row <= 13) return unlocked.has('C')
    return false
  }
  return true
}

// ─── Joystick ─────────────────────────────────────────────────────────────────
function Joystick({ onDir }: { onDir: (x: number, y: number) => void }) {
  const outer = useRef<HTMLDivElement>(null)
  const knob  = useRef<HTMLDivElement>(null)
  const on    = useRef(false)
  const R = 34
  const compute = (cx: number, cy: number) => {
    const el = outer.current; if (!el) return
    const b = el.getBoundingClientRect()
    const dx = cx - (b.left + b.width / 2), dy = cy - (b.top + b.height / 2)
    const d = Math.sqrt(dx*dx+dy*dy)
    onDir(Math.max(-1,Math.min(1,d>0?dx/Math.max(d,R):0)),Math.max(-1,Math.min(1,d>0?dy/Math.max(d,R):0)))
    if (knob.current) knob.current.style.transform =
      `translate(calc(-50% + ${(dx/Math.max(d,1))*Math.min(d,R)}px),calc(-50% + ${(dy/Math.max(d,1))*Math.min(d,R)}px))`
  }
  const reset = () => { on.current=false; onDir(0,0); if(knob.current) knob.current.style.transform='translate(-50%,-50%)' }
  return (
    <div ref={outer} style={{ width:R*2,height:R*2,borderRadius:'50%',background:'rgba(180,140,80,0.12)',border:'2px solid rgba(255,255,255,0.15)',position:'relative',touchAction:'none',userSelect:'none' }}
      onPointerDown={e=>{on.current=true;outer.current?.setPointerCapture(e.pointerId);compute(e.clientX,e.clientY)}}
      onPointerMove={e=>{if(on.current)compute(e.clientX,e.clientY)}}
      onPointerUp={reset} onPointerCancel={reset}>
      <div ref={knob} style={{ position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:24,height:24,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent,#D97706) 0%,#6366F1 100%)',boxShadow:'0 0 8px var(--accent,#D97706)',pointerEvents:'none' }} />
    </div>
  )
}

// ─── Quiz popup ───────────────────────────────────────────────────────────────
function QuizPopup({ door, isFD, onCorrect, onClose }:
  { door: typeof DOORS[number]; isFD: boolean; onCorrect:()=>void; onClose:()=>void }) {
  const [val, setVal]     = useState('')
  const [shake, setShake] = useState(0)
  const [hint, setHint]   = useState(false)
  const submit = () => {
    if (parseInt(val.trim(),10)===door.quizA) { onCorrect() }
    else { setShake(k=>k+1); if(isFD){setHint(true);setTimeout(()=>setHint(false),3500)} }
  }
  return (
    <div style={{ position:'fixed',inset:0,zIndex:500,background:'rgba(250,246,238,0.85)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
      <motion.div initial={{opacity:0,scale:0.88,y:18}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.88,y:18}}
        transition={{type:'spring',stiffness:340,damping:26}}
        style={{ maxWidth:420,width:'100%',background:'#fff',border:`2.5px solid ${door.color}66`,borderRadius:24,padding:'32px 28px',boxShadow:'0 10px 35px rgba(180,120,40,0.15)',display:'flex',flexDirection:'column',gap:20 }}>
        <div>
          <div style={{ fontSize:13,fontWeight:900,letterSpacing:'2px',color:door.color,marginBottom:8 }}>🔐 {door.label} — Jawab untuk membuka!</div>
          <p style={{ margin:0,fontSize:15,fontWeight:600,color:'#57534E',lineHeight:1.6 }}>Di dalam pintu ini tersimpan <strong style={{color:'#D97706',fontSize:17}}>{door.count} data</strong>. Jawab soal berikut:</p>
        </div>
        <div style={{ background:`${door.color}11`,border:`1.5px solid ${door.color}33`,borderRadius:16,padding:20,textAlign:'center' }}>
          <div style={{ fontSize:36,fontWeight:900,color:'#1C1917',fontFamily:'var(--font-data)' }}>{door.quizQ}</div>
        </div>
        <motion.div key={shake} animate={shake>0?{x:[-8,8,-5,5,0]}:{}} transition={{duration:0.35}}>
          <input type="number" value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}
            autoFocus placeholder="Jawaban kamu..."
            style={{ width:'100%',boxSizing:'border-box',background:'rgba(180,140,80,0.1)',border:`2px solid ${door.color}77`,borderRadius:14,padding:'14px 18px',color:'#1C1917',fontSize:24,fontWeight:900,textAlign:'center',fontFamily:'var(--font-data)',outline:'none' }} />
        </motion.div>
        <AnimatePresence>
          {hint&&<motion.div initial={{opacity:0,y:-5}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            style={{ padding:'12px 16px',borderRadius:12,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.25)',fontSize:15,fontWeight:600,color:'#44403C',lineHeight:1.6 }}>
            💡 {door.hint}
          </motion.div>}
        </AnimatePresence>
        <div style={{ display:'flex',gap:12 }}>
          <button className="game-btn game-btn-secondary" style={{flex:1,fontSize:15,fontWeight:800,padding:'10px 14px'}} onClick={onClose}>Kembali</button>
          <button className="game-btn game-btn-primary"   style={{flex:2,fontSize:15,fontWeight:800,padding:'10px 14px'}} onClick={submit}>Buka Pintu →</button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Counter overlay ──────────────────────────────────────────────────────────
function CounterResult({ onDone }: { onDone:()=>void }) {
  const [count,setCount] = useState(0)
  const [done,setDone]   = useState(false)
  const [btn,setBtn]     = useState(false)
  useEffect(()=>{
    let c=0; const id=setInterval(()=>{c++;setCount(c);if(c>=TOTAL_N){clearInterval(id);setTimeout(()=>setDone(true),300);setTimeout(()=>setBtn(true),1100)}},55)
    return ()=>clearInterval(id)
  },[])
  return (
    <div style={{ position:'fixed',inset:0,zIndex:600,background:'rgba(250,246,238,0.92)',backdropFilter:'blur(12px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
      <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:'spring',stiffness:300,damping:24}}
        style={{ maxWidth:460,width:'100%',background:'#fff',border:'2px solid rgba(217,119,6,0.5)',borderRadius:26,padding:'36px 32px',textAlign:'center',boxShadow:'0 10px 35px rgba(180,120,40,0.15)',display:'flex',flexDirection:'column',gap:22 }}>
        <div>
          <div style={{ fontSize:13,fontWeight:900,letterSpacing:'2px',color:'var(--accent,#D97706)',marginBottom:8 }}>⚙️ MESIN PENGHITUNG AKTIF</div>
          <h3 style={{ margin:0,fontSize:22,fontWeight:900,color:'#1C1917' }}>Menghitung seluruh data...</h3>
        </div>
        <div style={{ background:'rgba(217,119,6,0.06)',border:'2px solid rgba(217,119,6,0.3)',borderRadius:20,padding:'28px 20px' }}>
          <div style={{ fontSize:13,color:'#A8A29E',fontWeight:800,marginBottom:10,letterSpacing:'0.8px' }}>JUMLAH DATA TERKUMPUL (n)</div>
          <motion.div style={{ fontSize:84,fontWeight:900,color:'var(--accent,#D97706)',fontFamily:'var(--font-data)',lineHeight:1 }}
            animate={done?{scale:[1,1.1,1]}:{}} transition={{duration:0.6}}>{count}</motion.div>
        </div>
        <AnimatePresence>{done&&(
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} style={{ display:'flex',flexDirection:'column',gap:14 }}>
            <div style={{ padding:'16px 20px',borderRadius:16,background:'rgba(217,119,6,0.04)',border:'1px solid rgba(217,119,6,0.2)',fontSize:16,fontWeight:600,color:'#44403C',lineHeight:1.7,textAlign:'left' }}>
              Kamu telah mengumpulkan semua data dari 3 ruangan.<br/>
              Total ada <strong style={{color:'var(--accent,#D97706)'}}>{TOTAL_N} titik data</strong>.<br/>
              Ukuran sampelnya adalah <strong style={{color:'var(--accent,#D97706)',fontSize:19}}>n = {TOTAL_N}</strong>
            </div>
            {btn&&<button className="game-btn game-btn-primary" style={{width:'100%',fontSize:16,fontWeight:800,padding:'12px 18px'}} onClick={onDone}>Lanjut ke Banyak Kelas (K) →</button>}
          </motion.div>
        )}</AnimatePresence>
      </motion.div>
    </div>
  )
}

// ─── NPath main ───────────────────────────────────────────────────────────────
export default function NPath({ onComplete, isFD=true }: { onComplete:()=>void; isFD?:boolean }) {
  const [charPos, setCharPos]       = useState({ x: CX(1), y: CY(7) })
  const [unlocked, setUnlocked]     = useState<Set<DoorId>>(new Set())
  const [activeDoor, setActiveDoor] = useState<typeof DOORS[number]|null>(null)
  const [nearDoor, setNearDoor]     = useState<typeof DOORS[number]|null>(null)
  const [collected, setCollected]   = useState<Set<string>>(new Set())
  const [showCounter, setShowCounter] = useState(false)

  const dirRef       = useRef({x:0,y:0})
  const animRef      = useRef<number|null>(null)
  const activeDoorR  = useRef(activeDoor);  activeDoorR.current  = activeDoor
  const nearDoorR    = useRef(nearDoor);    nearDoorR.current    = nearDoor
  const unlockedR    = useRef(unlocked);    unlockedR.current    = unlocked
  const collectedR   = useRef(collected);   collectedR.current   = collected

  // RAF movement
  useEffect(()=>{
    const tick=()=>{
      if(!activeDoorR.current){
        const{x:dx,y:dy}=dirRef.current
        if(dx||dy){
          setCharPos(p=>{
            const nx=Math.max(CELL*0.5,Math.min(VW-CELL*0.5,p.x+dx*SPEED))
            const ny=Math.max(CELL*0.5,Math.min(VH-CELL*0.5,p.y+dy*SPEED))
            if(isWalkable(nx,ny,unlockedR.current)) return{x:nx,y:ny}
            if(isWalkable(nx,p.y,unlockedR.current)) return{x:nx,y:p.y}
            if(isWalkable(p.x,ny,unlockedR.current)) return{x:p.x,y:ny}
            return p
          })
        }
      }
      animRef.current=requestAnimationFrame(tick)
    }
    animRef.current=requestAnimationFrame(tick)
    return()=>{if(animRef.current) cancelAnimationFrame(animRef.current)}
  },[])

  // Keyboard
  useEffect(()=>{
    const MAP: Record<string,{x:number;y:number}>={
      ArrowUp:{x:0,y:-1},w:{x:0,y:-1},W:{x:0,y:-1},
      ArrowDown:{x:0,y:1},s:{x:0,y:1},S:{x:0,y:1},
      ArrowLeft:{x:-1,y:0},a:{x:-1,y:0},A:{x:-1,y:0},
      ArrowRight:{x:1,y:0},d:{x:1,y:0},D:{x:1,y:0},
    }
    const held=new Set<string>()
    const upd=()=>{let nx=0,ny=0;held.forEach(k=>{const d=MAP[k];if(d){nx+=d.x;ny+=d.y}});const l=Math.sqrt(nx*nx+ny*ny);dirRef.current=l>0?{x:nx/l,y:ny/l}:{x:0,y:0}}
    const dn=(e:KeyboardEvent)=>{
      if(activeDoorR.current){if(e.key==='Escape'){e.preventDefault();setActiveDoor(null)}return}
      if(MAP[e.key]){e.preventDefault();held.add(e.key);upd()}
      if((e.key==='Enter'||e.key===' ')&&nearDoorR.current&&!unlockedR.current.has(nearDoorR.current.id)){e.preventDefault();setActiveDoor(nearDoorR.current)}
    }
    const up=(e:KeyboardEvent)=>{held.delete(e.key);upd()}
    window.addEventListener('keydown',dn); window.addEventListener('keyup',up)
    return()=>{window.removeEventListener('keydown',dn);window.removeEventListener('keyup',up);dirRef.current={x:0,y:0}}
  },[])

  // Proximity (pure SVG units — no getBoundingClientRect)
  useEffect(()=>{
    const{x:cx,y:cy}=charPos
    let closest:typeof DOORS[number]|null=null,minD=Infinity
    for(const d of DOORS){
      if(unlockedR.current.has(d.id)) continue
      const dd=Math.hypot(d.x-cx,d.y-cy)
      if(dd<DOOR_PROX&&dd<minD){minD=dd;closest=d}
    }
    setNearDoor(closest)
    const nc=new Set(collectedR.current); let ch=false
    for(const c of DATA_CIRCLES){
      if(nc.has(c.id)||!unlockedR.current.has(c.d)) continue
      if(Math.hypot(c.x-cx,c.y-cy)<DATA_PROX){nc.add(c.id);ch=true}
    }
    if(ch) setCollected(nc)
  },[charPos])

  useEffect(()=>{if(collected.size>=TOTAL_N&&!showCounter) setTimeout(()=>setShowCounter(true),600)},[collected.size,showCounter])

  const handleCorrect=useCallback(()=>{
    if(!activeDoor) return
    setUnlocked(p=>new Set([...p,activeDoor.id]))
    setActiveDoor(null)
  },[activeDoor])

  const n=collected.size

  // Zone floor colours
  const zoneFloor=(col:number,row:number):string|null=>{
    if(col<ZONE_COL||col>=COLS-1) return null
    if(row>=1&&row<=4)   return unlocked.has('A')?'#0c0e22':'#060709'
    if(row>=6&&row<=8)   return unlocked.has('B')?'#160f06':'#060709'
    if(row>=10&&row<=13) return unlocked.has('C')?'#160614':'#060709'
    return null
  }

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100%',gap:10 }}>

      {/* Progress bar */}
      <div style={{ display:'flex',alignItems:'center',gap:12,padding:'8px 16px',background:'rgba(217,119,6,0.04)',border:'1px solid rgba(180,140,80,0.12)',borderRadius:14,flexShrink:0 }}>
        <div style={{ fontSize:13,fontWeight:900,letterSpacing:'1.2px',color:'var(--accent,#D97706)' }}>DATA</div>
        <div style={{ flex:1,height:6,background:'rgba(180,140,80,0.15)',borderRadius:3,overflow:'hidden' }}>
          <motion.div style={{ height:'100%',background:'var(--accent,#D97706)',borderRadius:3 }} animate={{ width:`${(n/TOTAL_N)*100}%` }} transition={{duration:0.4}} />
        </div>
        <div style={{ fontSize:14,fontWeight:900,color:'var(--accent,#D97706)',fontFamily:'var(--font-data)',minWidth:44,textAlign:'right' }}>{n}/{TOTAL_N}</div>
        {(DOORS as readonly typeof DOORS[number][]).map(d=>(
          <div key={d.id} style={{ width:8,height:8,borderRadius:'50%',background:unlocked.has(d.id)?d.color:'rgba(255,255,255,0.1)',transition:'background 0.3s' }} />
        ))}
      </div>

      {/* Canvas — fixed aspect ratio */}
      <div style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',borderRadius:16,border:'1px solid rgba(180,140,80,0.08)',minHeight:0,position:'relative' }}>
        <div style={{ width:'100%',maxHeight:'100%',aspectRatio:`${VW}/${VH}`,position:'relative' }}>
          <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet" style={{ width:'100%',height:'100%',display:'block' }}>

            {/* Background (walls) */}
            <rect width={VW} height={VH} fill="#060709" />

            {/* Floor tiles */}
            {MAZE.flatMap((row,r)=>row.map((cell,c)=>{
              if(cell===1) return null
              const zf=zoneFloor(c,r)
              const fill=zf??'#0f1122'
              return <rect key={`f${r}-${c}`} x={c*CELL+0.5} y={r*CELL+0.5} width={CELL-1} height={CELL-1} fill={fill} rx={0.4} />
            }))}

            {/* Subtle grid overlay on main maze */}
            <defs>
              <pattern id="gp" x={0} y={0} width={CELL} height={CELL} patternUnits="userSpaceOnUse">
                <path d={`M ${CELL} 0 L 0 0 0 ${CELL}`} fill="none" stroke="rgba(99,102,241,0.04)" strokeWidth={0.4}/>
              </pattern>
            </defs>
            <rect x={0} y={0} width={ZONE_COL*CELL} height={VH} fill="url(#gp)" />

            {/* Zone boundary outlines */}
            <rect x={ZONE_COL*CELL} y={CELL}     width={5*CELL} height={4*CELL} fill="none" stroke={unlocked.has('A')?'rgba(129,140,248,0.6)':'rgba(129,140,248,0.2)'} strokeWidth={0.8} rx={1} />
            <rect x={ZONE_COL*CELL} y={6*CELL}   width={5*CELL} height={3*CELL} fill="none" stroke={unlocked.has('B')?'rgba(251,146,60,0.6)':'rgba(251,146,60,0.2)'}  strokeWidth={0.8} rx={1} />
            <rect x={ZONE_COL*CELL} y={10*CELL}  width={5*CELL} height={4*CELL} fill="none" stroke={unlocked.has('C')?'rgba(244,114,182,0.6)':'rgba(244,114,182,0.2)'} strokeWidth={0.8} rx={1} />

            {/* Zone labels */}
            <text x={ZONE_COL*CELL+2.5*CELL} y={CELL+2*CELL} textAnchor="middle" fill="rgba(129,140,248,0.3)" fontSize={5} fontFamily="monospace" fontWeight="bold">RUANG A</text>
            <text x={ZONE_COL*CELL+2.5*CELL} y={6*CELL+1.5*CELL} textAnchor="middle" fill="rgba(251,146,60,0.3)"  fontSize={5} fontFamily="monospace" fontWeight="bold">RUANG B</text>
            <text x={ZONE_COL*CELL+2.5*CELL} y={10*CELL+2*CELL} textAnchor="middle" fill="rgba(244,114,182,0.3)" fontSize={5} fontFamily="monospace" fontWeight="bold">RUANG C</text>

            {/* Separator-row hint lines */}
            <line x1={0} y1={5*CELL} x2={ZONE_COL*CELL} y2={5*CELL} stroke="rgba(99,102,241,0.15)" strokeWidth={0.4} strokeDasharray="2,3"/>
            <line x1={0} y1={9*CELL} x2={ZONE_COL*CELL} y2={9*CELL} stroke="rgba(99,102,241,0.15)" strokeWidth={0.4} strokeDasharray="2,3"/>

            {/* Doors */}
            {(DOORS as readonly typeof DOORS[number][]).map(door=>{
              const open=unlocked.has(door.id)
              const near=nearDoor?.id===door.id&&!open
              return (
                <g key={door.id} style={{ cursor:open?'default':'pointer' }}
                  onClick={e=>{e.stopPropagation();if(!open&&!activeDoor) setActiveDoor(door)}}>
                  {near&&<circle cx={door.x} cy={door.y} r={10} fill={`${door.color}18`} stroke={`${door.color}55`} strokeWidth={0.7}/>}
                  <rect x={door.x-4.5} y={door.y-6.5} width={9} height={13} rx={2}
                    fill={open?`${door.color}25`:'#1a1a2e'} stroke={near?'#fff':door.color} strokeWidth={0.8} />
                  <text x={door.x} y={door.y+1.5} textAnchor="middle" dominantBaseline="middle" fontSize={6}>{open?'🚪':'🔒'}</text>
                  <text x={door.x} y={door.y+8.8} textAnchor="middle" fontSize={3.2} fontWeight="bold" fill={door.color} fontFamily="monospace">{door.label}</text>
                  {near&&<text x={door.x} y={door.y-9.5} textAnchor="middle" fontSize={3.8} fill={door.color} fontWeight="bold">ENTER / Tap</text>}
                </g>
              )
            })}

            {/* Data circles */}
            {DATA_CIRCLES.map(circle=>{
              if(!unlocked.has(circle.d)||collected.has(circle.id)) return null
              const col=DOORS.find(d=>d.id===circle.d)?.color??'#D97706'
              return <circle key={circle.id} cx={circle.x} cy={circle.y} r={2} fill={`${col}55`} stroke={`${col}cc`} strokeWidth={0.7} />
            })}

            {/* Character */}
            <defs>
              <radialGradient id="cg" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#ffffff"/>
                <stop offset="60%" stopColor="var(--accent,#D97706)"/>
                <stop offset="100%" stopColor="#4f46e5"/>
              </radialGradient>
              <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="1.8" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <circle cx={charPos.x} cy={charPos.y} r={3} fill="url(#cg)" filter="url(#glow)" />

            {/* Start marker (fades when player moves) */}
            {charPos.x===CX(1)&&charPos.y===CY(7)&&(
              <text x={CX(1)} y={CY(7)-6} textAnchor="middle" fontSize={3.2} fill="rgba(255,255,255,0.4)" fontFamily="monospace">START</text>
            )}
          </svg>

          {/* Joystick */}
          <div style={{ position:'absolute',bottom:8,left:8,zIndex:20 }}>
            <Joystick onDir={(x,y)=>{dirRef.current={x,y}}} />
          </div>

          {/* Mobile door button */}
          <AnimatePresence>
            {nearDoor&&!unlocked.has(nearDoor.id)&&!activeDoor&&(
              <motion.button initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} exit={{opacity:0,y:5}}
                onClick={()=>setActiveDoor(nearDoor)}
                style={{ position:'absolute',bottom:8,right:8,zIndex:20,background:nearDoor.color,color:'#fff',border:'none',borderRadius:20,padding:'8px 14px',fontSize:12,fontWeight:800,cursor:'pointer',boxShadow:`0 0 10px ${nearDoor.color}` }}>
                🔓 {nearDoor.label}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Guide */}
      <div style={{ fontSize:12,fontWeight:700,color:'rgba(255,255,255,0.4)',textAlign:'center',flexShrink:0,lineHeight:1.5 }}>
        ↑↓←→ / WASD / Joystick — Telusuri labirin, buka pintu data, dan kumpulkan semua titik informasi!
      </div>

      <AnimatePresence>
        {activeDoor&&<QuizPopup door={activeDoor} isFD={isFD} onCorrect={handleCorrect} onClose={()=>setActiveDoor(null)}/>}
      </AnimatePresence>
      {showCounter&&<CounterResult onDone={onComplete}/>}
    </div>
  )
}
