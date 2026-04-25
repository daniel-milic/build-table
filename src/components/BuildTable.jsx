import { useState, useMemo } from 'react'

export default function BuildTable({ dataset }) {
  const rawData = useMemo(() => {
    return dataset.rows.map(row => {
      const obj = {}
      dataset.columns.forEach((col, i) => {
        obj[col.key] = row[i]
      })
      return obj
    })
  }, [dataset])

  const [globalFilter, setGlobalFilter] = useState(dataset.globalFilter || '')
  const [sortConfig, setSortConfig] = useState(dataset.sortConfig || { key: null, direction: null })

  const filteredAndSortedData = useMemo(() => {
    let filtered = [...rawData]

    // Multi-term search with ';' (AND logic)
    if (globalFilter.trim()) {
      const terms = globalFilter
        .split(';')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean)

      if (terms.length > 0) {
        filtered = filtered.filter(row =>
          terms.every(term =>
            Object.values(row).some(val => 
              val?.toString().toLowerCase().includes(term)
            )
          )
        )
      }
    }

    // Sorting
    if (sortConfig.key && sortConfig.direction) {
      filtered.sort((a, b) => {
        const aVal = (a[sortConfig.key] || '').toString().toLowerCase()
        const bVal = (b[sortConfig.key] || '').toString().toLowerCase()
        return (aVal < bVal ? -1 : 1) * (sortConfig.direction === 'asc' ? 1 : -1)
      })
    }

    return filtered
  }, [rawData, globalFilter, sortConfig])

  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return prev.direction === 'asc'
          ? { key, direction: 'desc' }
          : { key: null, direction: null }
      }
      return { key, direction: 'asc' }
    })
  }

  return (
    <div className="table-container border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-xl compact-table">
      <table className="w-full">
        <thead className="bg-slate-50">
          {/* Global Search */}
          <tr>
            <th colSpan={dataset.columns.length} className="px-6 py-2 bg-white border-b border-slate-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search entire table... (use ; for multiple terms, e.g. Mr;Rick)"
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-sky-400 focus:ring-2 rounded-3xl pl-11 pr-5 py-2 outline-none text-[0.61rem]"
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">🔎</div>
              </div>
            </th>
          </tr>

          {/* Column Headers */}
          <tr>
            {dataset.columns.map(col => (
              <th
                key={col.key}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
                className={`px-6 py-3 text-left font-semibold text-slate-700 border-b border-slate-200 ${
                  col.sortable ? 'cursor-pointer hover:bg-slate-100' : ''
                }`}
                style={{ width: col.width || 'auto', textAlign: col.align || 'left' }}
              >
                <div className="flex items-center gap-x-2">
                  {col.label}
                  {col.sortable && (
                    <span className="text-lg leading-none text-slate-400">
                      {sortConfig.key === col.key
                        ? sortConfig.direction === 'asc' ? '↑' : '↓'
                        : '↕'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {filteredAndSortedData.length > 0 ? (
            filteredAndSortedData.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                {dataset.columns.map(col => (
                  <td
                    key={col.key}
                    className="px-6 text-slate-700"
                    style={{ textAlign: col.align || 'left' }}
                  >
                    {row[col.key] || '—'}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={dataset.columns.length} className="px-6 py-12 text-center text-slate-400 text-sm">
                No matching records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
