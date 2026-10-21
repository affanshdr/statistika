const fs = require('fs');
const path = require('path');

const filePath = 'app/siswa/game/_levels/level1/components/NPath.tsx';
const backupPath = 'app/siswa/game/_levels/level1/components/NPath.theme.backup.tsx';

if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(filePath, backupPath);
}

let content = fs.readFileSync(filePath, 'utf8');

// 1. Speech bubble backgrounds & borders
content = content.replaceAll(
  "background: 'linear-gradient(135deg, #FFFDF7 0%, #FEF3C7 100%)',",
  "background: 'linear-gradient(145deg, rgba(45, 26, 18, 0.95) 0%, rgba(26, 13, 8, 0.98) 100%)',"
);

content = content.replaceAll(
  "boxShadow: '0 8px 24px rgba(140, 98, 57, 0.25), inset 0 0 10px rgba(180, 140, 80, 0.15)',",
  "boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(251, 191, 36, 0.35)',\n                                  backdropFilter: 'blur(8px)',"
);

content = content.replaceAll(
  "boxShadow: '0 8px 26px rgba(140, 98, 57, 0.3), inset 0 0 10px rgba(180, 140, 80, 0.15)',",
  "boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(251, 191, 36, 0.35)',\n                                    backdropFilter: 'blur(8px)',"
);

// Dialogue speech text color
content = content.replaceAll(
  "color: '#362014',\n                                    fontFamily: 'var(--font-ui)',\n                                    textAlign: 'center',",
  "color: '#FEF3C7',\n                                    fontFamily: 'var(--font-ui)',\n                                    textAlign: 'center',\n                                    textShadow: '0 1px 2px rgba(0,0,0,0.8)',"
);

content = content.replaceAll(
  "color: '#362014',\n                                  fontFamily: 'var(--font-ui)',\n                                  textAlign: 'center',",
  "color: '#FEF3C7',\n                                  fontFamily: 'var(--font-ui)',\n                                  textAlign: 'center',\n                                  textShadow: '0 1px 2px rgba(0,0,0,0.8)',"
);

// Stevunt / Player name in speech bubble: vibrant gold
content = content.replaceAll(
  "color: '#0E8388', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px', textTransform: 'uppercase'",
  "color: '#FDE047', fontFamily: 'var(--font-ui)', letterSpacing: '0.5px', textTransform: 'uppercase', textShadow: '0 1px 3px rgba(0,0,0,0.8)'"
);

// Satpam / Teacher name in speech bubble: vibrant gold
content = content.replaceAll(
  "color: '#9A3412', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px', textTransform: 'uppercase'",
  "color: '#FDE047', fontFamily: 'var(--font-ui)', letterSpacing: '0.5px', textTransform: 'uppercase', textShadow: '0 1px 3px rgba(0,0,0,0.8)'"
);

// Speech bubble tail polygons: #FFFDF7 fill to #2D1A12
content = content.replaceAll('fill="#FFFDF7"\n                                stroke="#8C6239"', 'fill="#2D1A12"\n                                stroke="#F59E0B"');
content = content.replaceAll('fill="#FFFDF7"\n                                stroke={borderColor}', 'fill="#2D1A12"\n                                stroke={borderColor === \'#059669\' ? \'#10B981\' : borderColor === \'#DC2626\' ? \'#EF4444\' : \'#F59E0B\'}');
content = content.replaceAll('fill="#FFFDF7"\n                              stroke="#8C6239"', 'fill="#2D1A12"\n                              stroke="#F59E0B"');

// Bubble borders: border: '2px solid #8C6239' to border: '2.5px solid #F59E0B'
content = content.replaceAll("border: '2px solid #8C6239',", "border: '2.5px solid #F59E0B',");

// Satpam quiz options buttons
content = content.replaceAll(
  "background: '#FFFDF7',\n                                          border: '1.2px solid #B48C50',\n                                          color: '#362014',",
  "background: 'rgba(255, 255, 255, 0.08)',\n                                          border: '1.5px solid #F59E0B',\n                                          color: '#FEF3C7',"
);
content = content.replaceAll(
  "background: '#FEF3C7',\n                                          border: '1px solid #8C6239',\n                                          color: '#9A3412',",
  "background: '#F59E0B',\n                                          border: '1px solid #FDE047',\n                                          color: '#1F130B',"
);

// 2. Nametag pills: Pak Joko, Teachers, Mother Cat, interaction prompts
content = content.replaceAll(
  'fill="#FFFDF7"\n                            stroke={hasPassedSatpamQuiz ? \'#059669\' : \'#8C6239\'}',
  'fill="#2D1A12"\n                            stroke={hasPassedSatpamQuiz ? \'#10B981\' : \'#F59E0B\'}'
);
content = content.replaceAll(
  'fill={hasPassedSatpamQuiz ? \'#059669\' : \'#362014\'}\n                            fontSize={9.5}',
  'fill={hasPassedSatpamQuiz ? \'#34D399\' : \'#FEF3C7\'}\n                            fontSize={9.5}'
);

content = content.replaceAll(
  'fill="#FFFDF7"\n                              stroke={isCompleted ? \'#059669\' : \'#8C6239\'}',
  'fill="#2D1A12"\n                              stroke={isCompleted ? \'#10B981\' : \'#F59E0B\'}'
);
content = content.replaceAll(
  'fill="#362014"\n                              fontSize={11}\n                              fontWeight="900"\n                              fontFamily="var(--font-ui)"\n                              style={{ letterSpacing: \'0.3px\' }}',
  'fill="#FEF3C7"\n                              fontSize={11}\n                              fontWeight="900"\n                              fontFamily="var(--font-ui)"\n                              style={{ letterSpacing: \'0.3px\' }}'
);
content = content.replaceAll(
  'fill={isCompleted ? \'#059669\' : \'#9A3412\'}\n                              fontSize={9}',
  'fill={isCompleted ? \'#34D399\' : \'#FDE047\'}\n                              fontSize={9}'
);

content = content.replaceAll(
  'fill="#FFFDF7"\n                            stroke={catQuestStage === \'completed\' ? \'#059669\' : \'#8C6239\'}',
  'fill="#2D1A12"\n                            stroke={catQuestStage === \'completed\' ? \'#10B981\' : \'#F59E0B\'}'
);
content = content.replaceAll(
  'fill={catQuestStage === \'completed\' ? \'#059669\' : \'#362014\'}\n                            fontSize={9.5}',
  'fill={catQuestStage === \'completed\' ? \'#34D399\' : \'#FEF3C7\'}\n                            fontSize={9.5}'
);

// Interaction prompt button: [ E ] 👮 Bicara...
content = content.replaceAll(
  'fill="#FFFDF7"\n                                stroke="#8C6239"\n                                strokeWidth={2}',
  'fill="#2D1A12"\n                                stroke="#F59E0B"\n                                strokeWidth={2}'
);
content = content.replaceAll(
  'fill="#362014"\n                                fontSize={10.5}\n                                fontWeight="900"',
  'fill="#FEF3C7"\n                                fontSize={10.5}\n                                fontWeight="900"'
);

// In-room / facility prompt buttons
content = content.replaceAll('fill="#FFFDF7"\n                                stroke="#059669"', 'fill="#064E3B"\n                                stroke="#10B981"');
content = content.replaceAll('fill="#FFFDF7"\n                                stroke="#0284C7"', 'fill="#082F49"\n                                stroke="#38BDF8"');
content = content.replaceAll('fill="#362014"\n                                fontSize={10}\n                                fontWeight="900"', 'fill="#FEF3C7"\n                                fontSize={10}\n                                fontWeight="900"');

// 3. Quest Button on right HUD
content = content.replaceAll(
  `: 'linear-gradient(180deg, #FDF8EC 0%, #F5E8C7 100%)',
            border: n >= TOTAL_N ? '2px solid #059669' : '2px solid #8C6239',`,
  `: 'linear-gradient(180deg, #2D1A12 0%, #1A0D08 100%)',
            border: n >= TOTAL_N ? '2px solid #10B981' : '2px solid #F59E0B',`
);

content = content.replaceAll(
  `: '0 6px 20px rgba(0, 0, 0, 0.25), inset 0 0 10px rgba(180, 140, 80, 0.2)',`,
  `: '0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(251, 191, 36, 0.25)',`
);

content = content.replaceAll(
  "background: n >= TOTAL_N ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)' : 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',",
  "background: n >= TOTAL_N ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)' : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',\n              color: n >= TOTAL_N ? '#FFFFFF' : '#1F130B',"
);

content = content.replaceAll(
  "color: n >= TOTAL_N ? '#065F46' : '#6B4226',",
  "color: n >= TOTAL_N ? '#34D399' : '#FDE047',"
);

// 4. Quest Log Inventory Drawer Modal
content = content.replaceAll(
  "border: '2.5px solid #8C6239',",
  "border: '2.5px solid #F59E0B',"
);
content = content.replaceAll(
  "borderTop: '2.5px solid #8C6239', borderLeft: '2.5px solid #8C6239'",
  "borderTop: '2.5px solid #F59E0B', borderLeft: '2.5px solid #F59E0B'"
);
content = content.replaceAll(
  "borderTop: '2.5px solid #8C6239', borderRight: '2.5px solid #8C6239'",
  "borderTop: '2.5px solid #F59E0B', borderRight: '2.5px solid #F59E0B'"
);
content = content.replaceAll(
  "borderBottom: '2.5px solid #8C6239', borderLeft: '2.5px solid #8C6239'",
  "borderBottom: '2.5px solid #F59E0B', borderLeft: '2.5px solid #F59E0B'"
);
content = content.replaceAll(
  "borderBottom: '2.5px solid #8C6239', borderRight: '2.5px solid #8C6239'",
  "borderBottom: '2.5px solid #F59E0B', borderRight: '2.5px solid #F59E0B'"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated NPath.tsx with Dark Wood & Golden Yellow UI theme!');
