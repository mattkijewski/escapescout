import React, { useState, useMemo } from 'react'
import { Destination } from './types/destination'
import { FilterState } from './types/filter'
import { filterDestinations } from './utils/filterUtils'
import DestinationGrid from './components/DestinationGrid'
import FilterControls from './components/FilterControls'
import Header from './components/Header'
import destinations from './data/destinations.json'

const App: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    maxFlightTime: 8,
    budgetTier: null,
    month: null,
    vibe: null,
    minLgbtqRating: 1,
  })

  const filteredDestinations = useMemo(() => {
    return filterDestinations(destinations as Destination[], filters)
  }, [filters])

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFilters({
      maxFlightTime: 8,
      budgetTier: null,
      month: null,
      vibe: null,
      minLgbtqRating: 1,
    })
  }

  return (
    <div className="app">
      <Header />
      <main className="container">
        <FilterControls
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />
        <DestinationGrid
          destinations={filteredDestinations}
        />
      </main>
    </div>
  )
}

export default App