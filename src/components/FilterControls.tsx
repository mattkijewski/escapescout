import React from 'react'
import { FilterState, BudgetTier, VibeType } from '../types/filter'

interface FilterControlsProps {
  filters: FilterState
  onFilterChange: (filters: Partial<FilterState>) => void
  onClearFilters: () => void
}

const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const budgetOptions: { value: BudgetTier | null; label: string }[] = [
    { value: null, label: 'Any Budget' },
    { value: '$', label: 'Budget ($)' },
    { value: '$$', label: 'Mid-range ($$)' },
    { value: '$$$', label: 'Luxury ($$$)' },
  ]

  const vibeOptions: { value: VibeType | null; label: string }[] = [
    { value: null, label: 'Any Vibe' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'relaxation', label: 'Relaxation' },
    { value: 'culture', label: 'Culture' },
    { value: 'nightlife', label: 'Nightlife' },
    { value: 'nature', label: 'Nature' },
  ]

  const monthOptions: { value: number | null; label: string }[] = [
    { value: null, label: 'Any Month' },
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ]

  const filterStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: '2rem',
  }

  const labelStyle = {
    display: 'block',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#374151',
  }

  const inputStyle = {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '0.875rem',
  }

  const buttonStyle = {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    gridColumn: 'span 1',
  }

  return (
    <div style={filterStyle}>
      <div>
        <label style={labelStyle} htmlFor="flight-time">
          Max Flight Time: {filters.maxFlightTime}h
        </label>
        <input
          id="flight-time"
          type="range"
          min="1"
          max="12"
          value={filters.maxFlightTime}
          onChange={(e) => onFilterChange({ maxFlightTime: parseInt(e.target.value) })}
          style={inputStyle}
          aria-label="Maximum flight time in hours"
        />
      </div>

      <div>
        <label style={labelStyle} htmlFor="budget">
          Budget
        </label>
        <select
          id="budget"
          value={filters.budgetTier || ''}
          onChange={(e) => onFilterChange({ budgetTier: e.target.value as BudgetTier || null })}
          style={inputStyle}
          aria-label="Budget preference"
        >
          {budgetOptions.map(option => (
            <option key={option.label} value={option.value || ''}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle} htmlFor="month">
          Best Month
        </label>
        <select
          id="month"
          value={filters.month || ''}
          onChange={(e) => onFilterChange({ month: e.target.value ? parseInt(e.target.value) : null })}
          style={inputStyle}
          aria-label="Best month to visit"
        >
          {monthOptions.map(option => (
            <option key={option.label} value={option.value || ''}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle} htmlFor="vibe">
          Vibe
        </label>
        <select
          id="vibe"
          value={filters.vibe || ''}
          onChange={(e) => onFilterChange({ vibe: e.target.value as VibeType || null })}
          style={inputStyle}
          aria-label="Destination vibe preference"
        >
          {vibeOptions.map(option => (
            <option key={option.label} value={option.value || ''}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle} htmlFor="lgbtq-rating">
          Min LGBTQ+ Rating: {filters.minLgbtqRating}/5
        </label>
        <input
          id="lgbtq-rating"
          type="range"
          min="1"
          max="5"
          value={filters.minLgbtqRating}
          onChange={(e) => onFilterChange({ minLgbtqRating: parseInt(e.target.value) })}
          style={inputStyle}
          aria-label="Minimum LGBTQ+ friendliness rating"
        />
      </div>

      <button
        onClick={onClearFilters}
        style={buttonStyle}
        type="button"
        aria-label="Clear all filters"
      >
        Clear Filters
      </button>
    </div>
  )
}

export default FilterControls