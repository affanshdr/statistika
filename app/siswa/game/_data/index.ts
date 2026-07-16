import * as level1 from './level1'
import * as level2 from './level2'

export function getLevelData(id: string | number) {
  const levelId = typeof id === 'string' ? parseInt(id) : id
  if (levelId === 2) {
    return {
      config: level2.LEVEL2_CONFIG,
      rawData: level2.cyberbullyingData,
      classLabels: level2.CLASS_LABELS,
      getClassIndex: level2.getClassIndex,
      stats: level2.STATS,
      correctTable: level2.CORRECT_TABLE,
      histogramBars: level2.HISTOGRAM_BARS,
      correctVerdict: level2.CORRECT_VERDICT,
      verdictExplanation: level2.VERDICT_EXPLANATION,
      criticalKeywordsPositive: level2.CRITICAL_KEYWORDS_POSITIVE,
      criticalKeywordsEvidence: level2.CRITICAL_KEYWORDS_EVIDENCE,
      fdCriticalKeywordsEvidence: level2.FD_CRITICAL_KEYWORDS_EVIDENCE,
      mentorDialogAfterMythbust: level2.MENTOR_DIALOG_AFTER_MYTHBUST,
      badges: level2.BADGES,
    }
  }

  // Default to level 1
  return {
    config: level1.LEVEL1_CONFIG,
    rawData: level1.screenTimeData,
    classLabels: level1.CLASS_LABELS,
    getClassIndex: level1.getClassIndex,
    stats: level1.STATS,
    correctTable: level1.CORRECT_TABLE,
    histogramBars: level1.HISTOGRAM_BARS,
    correctVerdict: level1.CORRECT_VERDICT,
    verdictExplanation: level1.VERDICT_EXPLANATION,
    criticalKeywordsPositive: level1.CRITICAL_KEYWORDS_POSITIVE,
    criticalKeywordsEvidence: level1.CRITICAL_KEYWORDS_EVIDENCE,
    fdCriticalKeywordsEvidence: level1.FD_CRITICAL_KEYWORDS_EVIDENCE,
    mentorDialogAfterMythbust: level1.MENTOR_DIALOG_AFTER_MYTHBUST,
    badges: level1.BADGES,
  }
}
