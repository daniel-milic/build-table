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
      filtered.sort((a