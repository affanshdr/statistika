const fs = require('fs');
const path = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/app/siswa/game/_levels/level1/components/NPath.tsx';

let code = fs.readFileSync(path, 'utf8');

// 1. In enterClassroom:
// Ensure spawn position, facing direction 'left', and snappy 400ms auto cutscene
const enterReg = /setInsideRoom\(room\)[\r\n\s]+setCharPos\(LEVEL1_MAPS\[room\.id\]\?\.spawn \|\| \{ x: 1050, y: 510 \}\)/m;
const enterRep = `const isClassroom = ['A1', 'A2', 'B1', 'B2'].includes(room.id)
    const spawnPos = LEVEL1_MAPS[room.id]?.spawn || (isClassroom ? { x: 930, y: 540 } : { x: 1050, y: 510 })
    setInsideRoom(room)
    insideRoomR.current = room
    setCharPos(spawnPos)
    charPosRef.current = spawnPos
    if (isClassroom) {
      setCharDir('left')
      charDirRef.current = 'left'
    }`;

if (enterReg.test(code)) {
  code = code.replace(enterReg, enterRep);
  console.log('✅ Applied classroom spawn and left-facing direction in enterClassroom');
} else {
  console.warn('⚠️ Could not match enterClassroom spawn setter');
}

// Snappy auto cutscene trigger in enterClassroom
const animWaitReg = /if \(mapConfig\?\.teacher\?\.spriteUrl\) \{[\s\S]*?teacherTimerRef\.current = setTimeout\(\(\) => \{[\s\S]*?setTeacherCutsceneStage\('teacher_ask'\)[\s\S]*?\}, 500\)[\s\S]*?\}/m;
const snappyRep = `// Snappy 400ms auto cutscene in conversation mode
    teacherTimerRef.current = setTimeout(() => {
      setTeacherCutsceneStage('teacher_ask')
    }, 400)`;

if (animWaitReg.test(code)) {
  code = code.replace(animWaitReg, snappyRep);
  console.log('✅ Applied snappy 400ms cutscene trigger');
}

// 2. Block keyboard movement in classrooms
const keyMoveReg = /const keyNormalized = e\.key\.length === 1 \? e\.key\.toLowerCase\(\) : e\.key[\r\n\s]+if \(KEY_MAP\[keyNormalized\]\) \{[\r\n\s]+e\.preventDefault\(\)/m;
const keyMoveRep = `const keyNormalized = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (KEY_MAP[keyNormalized]) {
        e.preventDefault()
        if (insideRoomR.current && ['A1', 'A2', 'B1', 'B2'].includes(insideRoomR.current.id)) {
          // Strictly conversation mode inside classrooms: player cannot walk around
          return
        }`;

if (keyMoveReg.test(code) && !code.includes('Strictly conversation mode inside classrooms: player cannot walk around')) {
  code = code.replace(keyMoveReg, keyMoveRep);
  console.log('✅ Blocked movement keys in classrooms');
}

// 3. Make sure Enter/Space/E in classrooms triggers dialogue or opens modal
const enterKeyClassReg = /const distToTeacher = Math\.hypot\(charPosRef\.current\.x - teacherX, charPosRef\.current\.y - teacherY\)[\r\n\s]+if \(distToTeacher < 350 \|\| teacherCutsceneStageRef\.current\) \{/m;
const enterKeyClassRep = `const isClass = ['A1', 'A2', 'B1', 'B2'].includes(insideRoomR.current.id)
        const distToTeacher = Math.hypot(charPosRef.current.x - teacherX, charPosRef.current.y - teacherY)
        if (isClass || distToTeacher < 350 || teacherCutsceneStageRef.current) {`;

if (enterKeyClassReg.test(code)) {
  code = code.replace(enterKeyClassReg, enterKeyClassRep);
  console.log('✅ Ensured Enter/Space/E works anywhere in classroom');
}

fs.writeFileSync(path, code, 'utf8');
console.log('🎉 Done patching classroom conversation mode!');
