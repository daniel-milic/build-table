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

  const evenBgClass = dataset.rowConfig?.backgroundColor?.even || ''
  const oddBgClass = dataset.rowConfig?.backgroundColor?.odd || ''
  const toolbarBgClass = dataset.toolbarConfig?.backgroundColor || 'bg-slate-50'
  const theadBgClass = dataset.columnConfig?.backgroundColor || 'bg-slate-50'

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
              val?.toString().toLowerCase().includes