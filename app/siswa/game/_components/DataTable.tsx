'use client'

import { shareData } from '../_data/level1'

interface DataTableProps {
  highlightRow?: number
}

export default function DataTable({ highlightRow }: DataTableProps) {
  // Arrange 30 data points into rows of 5
  const rows: number[][] = []
  for (let i = 0; i < shareData.length; i += 5) {
    rows.push(shareData.slice(i, i + 5))
  }

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Jam ke-</th>
            <th>Jumlah Share</th>
            <th>No</th>
            <th>Jam ke-</th>
            <th>Jumlah Share</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 15 }).map((_, rowIdx) => {
            const left = rowIdx
            const right = rowIdx + 15
            return (
              <tr key={rowIdx}>
                <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{left + 1}</td>
                <td style={{ color: 'var(--text-secondary)' }}>Jam {left + 1}</td>
                <td style={{ 
                  color: 'var(--accent)', fontWeight: 700,
                  background: highlightRow === left ? 'rgba(0,255,136,0.08)' : undefined,
                }}>
                  {shareData[left].toLocaleString()}
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{right + 1}</td>
                <td style={{ color: 'var(--text-secondary)' }}>Jam {right + 1}</td>
                <td style={{ 
                  color: 'var(--accent)', fontWeight: 700,
                  background: highlightRow === right ? 'rgba(0,255,136,0.08)' : undefined,
                }}>
                  {shareData[right].toLocaleString()}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
