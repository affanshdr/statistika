export function getSpeechBubblePath(
  x: number,          // Left X
  y: number,          // Top Y
  w: number,          // Width
  h: number,          // Height
  r: number,          // Corner radius
  tailTipX: number,   // Speaker head X (tip of pointer)
  tailTipY: number,   // Speaker head Y (tip of pointer)
  tailWidth = 24      // Base width of tail on bubble edge
): string {
  const halfTail = tailWidth / 2
  const minBaseX = x + r + halfTail + 4
  const maxBaseX = x + w - r - halfTail - 4
  const baseX = Math.max(minBaseX, Math.min(maxBaseX, tailTipX))

  if (tailTipY >= y + h) {
    // Normal: Bubble is ABOVE the speaker, tail points DOWNWARD to head
    const tipY = Math.max(y + h + 8, tailTipY)
    return `M ${x + r} ${y} H ${x + w - r} A ${r} ${r} 0 0 1 ${x + w} ${y + r} V ${y + h - r} A ${r} ${r} 0 0 1 ${x + w - r} ${y + h} H ${baseX + halfTail} L ${tailTipX} ${tipY} L ${baseX - halfTail} ${y + h} H ${x + r} A ${r} ${r} 0 0 1 ${x} ${y + h - r} V ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`.replace(/\s+/g, ' ').trim()
  } else {
    // Inverted: Bubble is BELOW the speaker, tail points UPWARD to head
    const tipY = Math.min(y - 8, tailTipY)
    return `M ${x + r} ${y} H ${baseX - halfTail} L ${tailTipX} ${tipY} L ${baseX + halfTail} ${y} H ${x + w - r} A ${r} ${r} 0 0 1 ${x + w} ${y + r} V ${y + h - r} A ${r} ${r} 0 0 1 ${x + w - r} ${y + h} H ${x + r} A ${r} ${r} 0 0 1 ${x} ${y + h - r} V ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`.replace(/\s+/g, ' ').trim()
  }
}
