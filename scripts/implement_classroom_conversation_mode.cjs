const fs = require('fs');
const path = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/app/siswa/game/_levels/level1/components/NPath.tsx';

let code = fs.readFileSync(path, 'utf8');

// 1. In enterClassroom: snappy 400ms delay for teacher dialogue, set charDir to 'left'
const enterClassroomTarget = `    gameAudio.playDoorOpen()
    resetMovement()
    lastHallwayPosRef.current = { x: room.x, y: room.y + 20 }
    setInsideRoom(room)
    setCharPos(LEVEL1_MAPS[room.id]?.spawn || { x: 1050, y: 510 })`;

const enterClassroomReplacement = `    gameAudio.playDoorOpen()
    resetMovement()
    lastHallwayPosRef.current = { x: room.x, y: room.y + 20 }
    const isClassroom = ['A1', 'A2', 'B1', 'B2'].includes(room.id)
    const spawnPos = LEVEL1_MAPS[room.id]?.spawn || (isClassroom ? { x: 930, y: 540 } : { x: 1050, y: 510 })
    setInsideRoom(room)
    insideRoomR.current = room
    setCharPos(spawnPos)
    charPosRef.current = spawnPos
    if (isClassroom) {
      setCharDir('left')
      charDirRef.current = 'left'
    }`;

if (code.includes(enterClassroomTarget)) {
  code = code.replace(enterClassroomTarget, enterClassroomReplacement);
  console.log('✅ Updated enterClassroom spawn and direction');
} else {
  console.warn('⚠️ Could not match enterClassroomTarget');
}

// Snappy auto-trigger delay in enterClassroom
code = code.replace(
  `    if (mapConfig?.teacher?.spriteUrl) {
      setTeacherCutsceneStage('anim_wait')
      const animDuration = (mapConfig.teacher.totalFrames || 24) * (mapConfig.teacher.speedMs || 90)
      teacherTimerRef.current = setTimeout(() => {
        setTeacherCutsceneStage('teacher_ask')
      }, animDuration)
    } else {
      // Auto-trigger teacher dialogue bubble 500ms after entering room (same auto-start experience as VII-A)
      teacherTimerRef.current = setTimeout(() => {
        setTeacherCutsceneStage('teacher_ask')
      }, 500)
    }`,
  `    // Snappy auto-trigger teacher dialogue in conversation mode
    teacherTimerRef.current = setTimeout(() => {
      setTeacherCutsceneStage('teacher_ask')
    }, 450)`
);
console.log('✅ Updated snappy teacher cutscene trigger');

// 2. In game loop: freeze movement in classrooms
const gameLoopCheck = `if (!activeDoor && !activeClass && !showWaliKelasPopup && !activeFacilityR.current && !showLibraryBookModalR.current && !showLabTerminalModalR.current && satpamChatStageR.current === 'idle' && !isCinematicActive && !isTransitioningRef.current) {`;
const gameLoopFreeze = `if (!activeDoor && !activeClass && !showWaliKelasPopup && !activeFacilityR.current && !showLibraryBookModalR.current && !showLabTerminalModalR.current && satpamChatStageR.current === 'idle' && !isCinematicActive && !isTransitioningRef.current) {
        if (insideRoomR.current && ['A1', 'A2', 'B1', 'B2'].includes(insideRoomR.current.id)) {
          // Strictly conversation mode in classrooms: Stevunt stands respectfully at the entrance
          return
        }`;

if (code.includes(gameLoopCheck) && !code.includes('Strictly conversation mode in classrooms')) {
  code = code.replace(gameLoopCheck, gameLoopFreeze);
  console.log('✅ Injected movement freeze in game loop for classrooms');
}

// 3. In keyboard listener: block arrow/WASD movement keys in classrooms
const keyMapTarget = `      const keyNormalized = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (KEY_MAP[keyNormalized]) {
        e.preventDefault()
        pressedKeysRef.current.add(keyNormalized)
        updateDir()
      }`;

const keyMapReplacement = `      const keyNormalized = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (KEY_MAP[keyNormalized]) {
        e.preventDefault()
        if (insideRoomR.current && ['A1', 'A2', 'B1', 'B2'].includes(insideRoomR.current.id)) {
          // Movement keys disabled in classrooms (pure conversation mode)
          return
        }
        pressedKeysRef.current.add(keyNormalized)
        updateDir()
      }`;

if (code.includes(keyMapTarget)) {
  code = code.replace(keyMapTarget, keyMapReplacement);
  console.log('✅ Blocked movement keys in keyboard listener for classrooms');
}

// 4. In Space / Enter / E handler: allow advancing dialogue anywhere in classroom
const interactKeyTarget = `      if (insideRoomR.current && (e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E')) {
        const teacherX = LEVEL1_MAPS[insideRoomR.current.id]?.teacher?.x || 650
        const teacherY = LEVEL1_MAPS[insideRoomR.current.id]?.teacher?.y || 430
        const distToTeacher = Math.hypot(charPosRef.current.x - teacherX, charPosRef.current.y - teacherY)
        if (distToTeacher < 350 || teacherCutsceneStageRef.current) {
          e.preventDefault()
          handleInteractTeacher(insideRoomR.current)
        }
      }`;

const interactKeyReplacement = `      if (insideRoomR.current && (e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E')) {
        if (['A1', 'A2', 'B1', 'B2'].includes(insideRoomR.current.id)) {
          e.preventDefault()
          if (!showWaliKelasPopupR.current) {
            handleInteractTeacher(insideRoomR.current)
          }
          return
        }
        const teacherX = LEVEL1_MAPS[insideRoomR.current.id]?.teacher?.x || 650
        const teacherY = LEVEL1_MAPS[insideRoomR.current.id]?.teacher?.y || 430
        const distToTeacher = Math.hypot(charPosRef.current.x - teacherX, charPosRef.current.y - teacherY)
        if (distToTeacher < 350 || teacherCutsceneStageRef.current) {
          e.preventDefault()
          handleInteractTeacher(insideRoomR.current)
        }
      }`;

if (code.includes(interactKeyTarget)) {
  code = code.replace(interactKeyTarget, interactKeyReplacement);
  console.log('✅ Updated Enter/Space/E key interaction for classrooms');
}

// 5. Update prompt button inside classroom (always show when not in popup or active speech)
const oldClassroomPromptTarget = `                          const teacherX = 580
                          const teacherY = 490
                          const distToTeacher = Math.hypot(charPos.x - teacherX, charPos.y - teacherY)
                          if (distToTeacher >= 150 || showWaliKelasPopup) return null

                          const buttonW = 170
                          const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                          const textX = buttonLeft + buttonW / 2

                          return (
                            <motion.g
                              key={\`btn-talk-\${insideRoom.id}\`}
                              initial={{ opacity: 0, scale: 0.8, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 5 }}
                              onClick={() => setShowWaliKelasPopup(insideRoom)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              style={{ cursor: 'pointer' }}
                            >
                              <rect
                                x={buttonLeft}
                                y={btnY}
                                width={buttonW}
                                height={26}
                                rx={13}
                                fill="#2D1A12"
                                stroke="#F59E0B"
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.25))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#FEF3C7" fontSize={10.5}
                                fontWeight="bold"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)' }}
                              >
                                🗣️ Bicara & Minta Data
                              </text>
                            </motion.g>
                          )`;

const newClassroomPromptReplacement = `                          if (showWaliKelasPopup || teacherCutsceneStage !== null) return null
                          const isSaved = savedClasses.has(insideRoom.id)
                          const buttonW = 200
                          const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                          const textX = buttonLeft + buttonW / 2

                          return (
                            <motion.g
                              key={\`btn-talk-\${insideRoom.id}\`}
                              initial={{ opacity: 0, scale: 0.8, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 5 }}
                              onClick={() => {
                                if (isSaved) {
                                  setShowWaliKelasPopup(insideRoom)
                                } else {
                                  handleInteractTeacher(insideRoom)
                                }
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              style={{ cursor: 'pointer' }}
                            >
                              <rect
                                x={buttonLeft - 10}
                                y={btnY}
                                width={buttonW + 20}
                                height={28}
                                rx={6}
                                fill="#2D1A12"
                                stroke={isSaved ? '#10B981' : '#F59E0B'}
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.6))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY + 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={isSaved ? '#34D399' : '#FEF3C7'}
                                fontSize={10.5}
                                fontWeight="900"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}
                              >
                                {isSaved ? \`✓ Buka Data \${insideRoom.label}\` : \`[ E ] 🗣️ Bicara dgn Wali Kelas\`}
                              </text>
                            </motion.g>
                          )`;

if (code.includes(oldClassroomPromptTarget)) {
  code = code.replace(oldClassroomPromptTarget, newClassroomPromptReplacement);
  console.log('✅ Replaced classroom talk prompt button');
} else {
  console.warn('⚠️ Could not match oldClassroomPromptTarget, trying regex...');
  const regPrompt = /const teacherX = 580[\s\S]*?🗣️ Bicara & Minta Data[\s\S]*?<\/motion\.g>\s*\)/m;
  if (regPrompt.test(code)) {
    code = code.replace(regPrompt, newClassroomPromptReplacement);
    console.log('✅ Replaced classroom talk prompt button via regex');
  }
}

// 6. Hide Virtual Joystick on Mobile when inside classrooms
const joystickTarget = `{/* Joystick */}
          <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 50, touchAction: 'none' }}>
            <Joystick onDir={(x, y) => { const nextDir = { x, y }; dirRef.current = nextDir; setMoveDir(nextDir); }} />
          </div>`;

const joystickReplacement = `{/* Joystick (Hidden when inside classrooms for conversation mode) */}
          {(!insideRoom || !['A1', 'A2', 'B1', 'B2'].includes(insideRoom.id)) && (
            <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 50, touchAction: 'none' }}>
              <Joystick onDir={(x, y) => { const nextDir = { x, y }; dirRef.current = nextDir; setMoveDir(nextDir); }} />
            </div>
          )}`;

if (code.includes(joystickTarget)) {
  code = code.replace(joystickTarget, joystickReplacement);
  console.log('✅ Hidden joystick on mobile inside classrooms');
} else {
  // Regex search
  const jReg = /\{\/\*\s*Joystick\s*\*\/\}[\s\S]*?<div style=\{\{ position: 'absolute', bottom: 20, left: 20, zIndex: 50, touchAction: 'none' \}\}>[\s\S]*?<Joystick[\s\S]*?<\/div>/m;
  if (jReg.test(code)) {
    code = code.replace(jReg, joystickReplacement);
    console.log('✅ Hidden joystick on mobile inside classrooms via regex');
  }
}

fs.writeFileSync(path, code, 'utf8');
console.log('🎉 Successfully implemented classroom conversation mode!');
