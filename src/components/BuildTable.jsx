import { useState, useMemo, useCallback, useEffect } from 'react'

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

  const totalRows = rawData.length

  const [globalFilter, setGlobalFilter] = useState(dataset.globalFilter || '')
  const [sortConfig, setSortConfig] = useState(dataset.sortConfig || { key: null, direction: 'asc' })
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)

  const requestSort = useCallback((key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }, [sortConfig])

  const filteredSortedData = useMemo(() => {
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

  const totalFiltered = filteredSortedData.length

  const paginatedData = useMemo(() => {
    if (rowsPerPage === 0) {
      return filteredSortedData
    }
    const start = (currentPage - 1) * rowsPerPage
    const end = start + rowsPerPage
    return filteredSortedData.slice(start, end)
  }, [filteredSortedData, currentPage, rowsPerPage])

  const totalPages = rowsPerPage === 0 ? 1 : Math.ceil(totalFiltered / rowsPerPage)

  // Reset to page 1 on filter/sort/rowsPerPage change
  useEffect(() => {
    setCurrentPage(1)
  }, [globalFilter, sortConfig, rowsPerPage])

  // Clamp currentPage if it exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [totalFiltered, rowsPerPage, totalPages, currentPage])

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value))
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const rowCountText = totalFiltered === 0 ? '' : `Rows ${totalFiltered} of ${totalRows}`

  const getSortIcon = (colKey) => {
    if (sortConfig.key !== colKey) return ''
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
  }

  const rowOptions = dataset.rowOptions || [10, 25, 50, 100, 0]

  return (
    <div className="w-full table-container border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-xl">
      {/* Global Filter Row: 3-column layout */}
      <div className="p-1 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
        {/* LHS Column: Dropdown + Row Count (left-justified) */}
        <div className="flex items-center gap-3 flex-none">
          <select
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="px-3 py-1 border border-slate-300 rounded-xl border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all min-w-[80px]"
          >
            {rowOptions.map((option) => (
              <option key={option} value={option}>
                {option === 0 ? 'All' : option}
              </option>
            ))}
          </select>
          {totalFiltered > 0 && (
            <div className="text-slate-500 whitespace-nowrap px-3 py-0.5 bg-slate-100 rounded-xl">
              {rowCountText}
            </div>
          )}
        </div>

        {/* Center Column: Title (centered) */}
        <div className="flex-1 flex justify-center items-center">
          {dataset.title && (
            <div className="text-lg font-bold text-slate-800 whitespace-nowrap px-3 py-0.5 bg-slate-100 rounded-xl">
              {dataset.title}
            </div>
          )}
        </div>

        {/* RHS Column: Search Input (left-justified, fills space) */}
        <div className="flex-1 flex items-center ml-4">
          <input
            type="text"
            placeholder="Search... (use ; between terms)"
            className="flex-1 px-4 py-1 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
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
          {paginatedData.length === 0 ? (
            <tr>
              <td
                colSpan={dataset.columns.length}
                className="p-12 text-center text-slate-500"
              >
                {totalFiltered === 0
                  ? globalFilter.trim()
                    ? 'No matching results'
                    : 'No data'
                  : 'No results on this page'}
              </td>
            </tr>
          ) : (
            paginatedData.map((row, rowIndex) => (
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

      {/* Pagination Footer */}
      {totalFiltered > 0 && totalPages > 1 && (
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <div className="text-sm text-slate-600 font-medium">
            Page {currentPage} of {totalPages}
          </div>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
