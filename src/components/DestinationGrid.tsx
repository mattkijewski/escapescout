import React from 'react'
import { Destination } from '../types/destination'
import DestinationCard from './DestinationCard'

interface DestinationGridProps {
  destinations: Destination[]
}

const DestinationGrid: React.FC<DestinationGridProps> = ({ destinations }) => {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
    padding: '1rem 0',
  }

  if (destinations.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        color: '#6b7280',
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          No destinations found
        </h2>
        <p>Try adjusting your filters to see more results.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '1rem',
        color: '#374151',
      }}>
        {destinations.length} destination{destinations.length !== 1 ? 's' : ''} found
      </h2>
      <div style={gridStyle}>
        {destinations.map((destination) => (
          <DestinationCard
            key={destination.name}
            destination={destination}
          />
        ))}
      </div>
    </div>
  )
}

export default DestinationGrid