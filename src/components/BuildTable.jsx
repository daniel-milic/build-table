import { useState, useMemo, useCallback } from 'react'

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
  const [sortConfig, setSortConfig] = useState(dataset.sortConfig || { key: null, direction: 'asc' })

  const requestSort = useCallback((key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }, [sortConfig])

  const filteredAndSortedData = useMemo(() => {
    let filtered = [...rawData]

    // Global multi-term search with ';' (AND logic)
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
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = (a[sortConfig.key] || '').toString().toLowerCase()
        let bVal = (b[sortConfig.key] || '').toString().toLowerCase()
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }, [rawData, globalFilter, sortConfig])

  const getSortIcon = (colKey) => {
    if (sortConfig.key !== colKey) return ''
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <div className="w-full table-container border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-xl">
      {/* Global Filter */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <input
          type="text"
          placeholder="Search all columns (use ; for multiple terms)"
          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      <table className="compact-table w-full">
        <thead className="bg-slate-50">
          <tr>
            {dataset.columns.map((col) => (
              <th
                key={col.key}
                className={`px-3 py-2.5 font-semibold text-slate-700 text-left cursor-pointer hover:bg-slate-100 transition-colors first:rounded-tl-xl last:rounded-tr-xl ${
                  col.align === 'center' ? 'text-center' : ''
                }`}
                style={col.width ? { width: col.width } : {}}
                onClick={() => col.sortable && requestSort(col.key)}
              >
                <span className="select-none">
                  {col.label}
                  {getSortIcon(col.key)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedData.length === 0 ? (
            <tr>
              <td
                colSpan={dataset.columns.length}
                className="p-12 text-center text-slate-500"
              >
                {globalFilter ? 'No matching results' : 'No data'}
              </td>
            </tr>
          ) : (
            filteredAndSortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors"
              >
                {dataset.columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-3 py-2 text-slate-900 first:pl-4 last:pr-4 ${
                      col.align === 'center' ? 'text-center' : ''
                    }`}
                    style={col.width ? { width: col.width } : {}}
                  >
                    {row[col.key] || ''}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
