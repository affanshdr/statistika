'use client'

import { screenTimeData } from '../_data/level1'

interface DataTableProps {
  highlightRow?: number
}

export default function DataTable({ highlightRow }: DataTableProps) {
  // Arrange data points dynamically into 2 columns
  const half = Math.ceil(screenTimeData.length / 2)

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Siswa ke-</th>
            <th>Screen Time (jam/hari)</th>
            <th>No</th>
            <th>Siswa ke-</th>
            <th>Screen Time (jam/hari)</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: half }).map((_, rowIdx) => {
            const left = rowIdx
            const right = rowIdx + half
            return (
              <tr key={rowIdx}>
                <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{left + 1}</td>
                <td style={{ color: 'var(--text-secondary)' }}>Siswa {left + 1}</td>
                <td style={{
                  color: 'var(--accent)', fontWeight: 700,
                  background: highlightRow === left ? 'rgba(0,255,136,0.08)' : undefined,
                }}>
                  {screenTimeData[left].toFixed(1)}
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{right + 1}</td>
                <td style={{ color: 'var(--text-secondary)' }}>Siswa {right + 1}</td>
                <td style={{
                  color: 'var(--accent)', fontWeight: 700,
                  background: highlightRow === right ? 'rgba(0,255,136,0.08)' : undefined,
                }}>
                  {screenTimeData[right] !== undefined ? screenTimeData[right].toFixed(1) : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
