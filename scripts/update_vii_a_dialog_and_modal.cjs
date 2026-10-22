const fs = require('fs');
const path = require('path');

// 1. Update WaliKelasModal.tsx
const modalFile = path.join(__dirname, '../app/siswa/game/_levels/level1/components/modals/WaliKelasModal.tsx');
let modalContent = fs.readFileSync(modalFile, 'utf-8');

// Hide sample table when visualBowls is present
const oldTableStart = `{/* 1. Preview Tabel Data Siswa Kelas */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1.5px solid #F59E0B',
          borderRadius: '14px',`;

const newTableStart = `{/* 1. Preview Tabel Data Siswa Kelas (Disembunyikan pada kuis mandiri seperti Mangkuk Kelereng) */}
        {!quiz.visualBowls && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1.5px solid #F59E0B',
          borderRadius: '14px',`;

if (modalContent.includes(oldTableStart)) {
  modalContent = modalContent.replace(oldTableStart, newTableStart);
  
  // Now find the closing </div> of table and add closing parenthesis )}
  const targetEnd = `              </div>
            ))}
          </div>
        </div>

        {/* 2. Kartu Tantangan`;
  const replacementEnd = `              </div>
            ))}
          </div>
        </div>
        )}

        {/* 2. Kartu Tantangan`;
  if (modalContent.includes(targetEnd)) {
    modalContent = modalContent.replace(targetEnd, replacementEnd);
    console.log('Sample table wrapped in {!quiz.visualBowls && ...} successfully!');
  } else {
    console.error('Could not find targetEnd in WaliKelasModal.tsx');
  }
} else {
  console.error('Could not find oldTableStart in WaliKelasModal.tsx');
}

// Update introQuote for A1
modalContent = modalContent.replace(
  "introQuote: 'Karena kamu telat datang, selesaikan dulu tantangan teka-teki kelereng Ibu baru datanya boleh diambil!',",
  "introQuote: 'Selesaikan tantangan teka-teki kelereng ini dengan tepat untuk membuka data screen time kelas!',"
);

fs.writeFileSync(modalFile, modalContent, 'utf-8');
console.log('WaliKelasModal.tsx updated successfully!');

// 2. Update NPath.tsx for Bu Sari's teacher_reply dialogue
const npathFile = path.join(__dirname, '../app/siswa/game/_levels/level1/components/NPath.tsx');
let npathContent = fs.readFileSync(npathFile, 'utf-8');

const oldTeacherReplyBranch = `actionText = insideRoom.id === 'RG' ? '[ Buka Papan Analisis ➔ ]' : '[ Ambil Data ➔ ]'
                            if (insideRoom.id === 'RG') {
                              dialogueText = (
                                <>
                                  <span style={{ color: '#34D399', fontWeight: 900 }}>"Kerja luar biasa, Stevunt!"</span>
                                  <br />
                                  "Mari kita olah seluruh data ini di Papan Analisis untuk memeriksa klaim viral tersebut!"
                                </>
                              )
                            } else if (insideRoom.id === 'A2') {
                              dialogueText = (
                                <>
                                  "Oalah Sutrisno... Ya sudah, ini data 7 teman sekelasmu."
                                  <br />
                                  <span style={{ color: '#93C5FD', fontWeight: 800 }}>"Pelajari dengan teliti untuk bahan analisismu nanti ya!"</span>
                                </>
                              )
                            } else {
                              dialogueText = (
                                <>
                                  "Oh begitu! Baiklah, ini sampel data"
                                  <br />
                                  {\`screen time \${classStudentCount} siswa dari \${insideRoom.label}.\`}
                                </>
                              )
                            }`;

// Note that insideRoom.id === 'RG' might have special characters or slightly different spacing, let's search for teacher_reply
const replyIdx = npathContent.indexOf("teacherCutsceneStage === 'teacher_reply'");
if (replyIdx !== -1) {
  const sub = npathContent.slice(replyIdx, replyIdx + 1600);
  console.log('Found teacherCutsceneStage === teacher_reply area!');
}

// Let's replace the actionText and dialogueText cleanly in NPath.tsx
const targetSnippet = `actionText = insideRoom.id === 'RG' ? '[ Buka Papan Analisis`;
const snippetIdx = npathContent.indexOf(targetSnippet);
if (snippetIdx !== -1) {
  // Find the end of this block before post_stevunt_report
  const endBlock = npathContent.indexOf("} else if (teacherCutsceneStage === 'post_stevunt_report')", snippetIdx);
  if (endBlock !== -1) {
    const newBlock = `actionText = insideRoom.id === 'RG' ? '[ Buka Papan Analisis ➔ ]' : '[ Buka Tantangan ➔ ]'
                            if (insideRoom.id === 'RG') {
                              dialogueText = (
                                <>
                                  <span style={{ color: '#34D399', fontWeight: 900 }}>"Kerja luar biasa, Stevunt!"</span>
                                  <br />
                                  "Mari kita olah seluruh data ini di Papan Analisis untuk memeriksa klaim viral tersebut!"
                                </>
                              )
                            } else if (insideRoom.id === 'A1') {
                              dialogueText = (
                                <>
                                  "Ini data screen time 5 siswa Kelas VII-A."
                                  <br />
                                  <span style={{ color: '#FDE047', fontWeight: 900 }}>"Tapi sebelum Ibu serahkan datanya, coba jawab dulu tantangan ini!"</span>
                                </>
                              )
                            } else if (insideRoom.id === 'A2') {
                              dialogueText = (
                                <>
                                  "Oalah Sutrisno... Ya sudah, ini data 7 teman sekelasmu."
                                  <br />
                                  <span style={{ color: '#93C5FD', fontWeight: 800 }}>"Tapi sebelum kamu ambil, selesaikan dulu tantangan Bapak ini ya!"</span>
                                </>
                              )
                            } else {
                              dialogueText = (
                                <>
                                  {\`Ini data screen time \${classStudentCount} siswa dari \${insideRoom.label}.\`}
                                  <br />
                                  <span style={{ color: '#FDE047', fontWeight: 900 }}>"Tapi sebelum Ibu serahkan, selesaikan dulu tantangan ini ya!"</span>
                                </>
                              )
                            }
                          `;
    npathContent = npathContent.slice(0, snippetIdx) + newBlock + npathContent.slice(endBlock);
    fs.writeFileSync(npathFile, npathContent, 'utf-8');
    console.log('NPath.tsx teacher_reply dialogue updated successfully!');
  } else {
    console.error('Could not find endBlock in NPath.tsx');
  }
} else {
  console.error('Could not find targetSnippet in NPath.tsx');
}
