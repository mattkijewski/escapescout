import React from 'react'
import { Destination } from '../types/destination'

interface DestinationCardProps {
  destination: Destination
}

const DestinationCard: React.FC<DestinationCardProps> = ({ destination }) => {
  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  }

  const imageStyle = {
    width: '100%',
    height: '200px',
    backgroundColor: '#e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280',
    fontSize: '0.875rem',
  }

  const contentStyle = {
    padding: '1.5rem',
  }

  const titleStyle = {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#1f2937',
  }

  const locationStyle = {
    color: '#6b7280',
    fontSize: '0.875rem',
    marginBottom: '1rem',
  }

  const detailsStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.5rem',
    fontSize: '0.875rem',
    marginBottom: '1rem',
  }

  const labelStyle = {
    color: '#6b7280',
    fontWeight: '500',
  }

  const valueStyle = {
    color: '#1f2937',
  }

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]

  const bestMonthsText = destination.best_months.map(month => monthNames[month - 1]).join(', ')

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  return (
    <div 
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div style={imageStyle}>
        {destination.name} Photo
      </div>
      
      <div style={contentStyle}>
        <h3 style={titleStyle}>{destination.name}</h3>
        <p style={locationStyle}>{destination.location}</p>
        
        <div style={detailsStyle}>
          <span style={labelStyle}>Budget:</span>
          <span style={valueStyle}>{destination.budget_tier}</span>
          
          <span style={labelStyle}>Flight:</span>
          <span style={valueStyle}>{destination.flight_time}h</span>
          
          <span style={labelStyle}>Best months:</span>
          <span style={valueStyle}>{bestMonthsText}</span>
          
          <span style={labelStyle}>Vibe:</span>
          <span style={valueStyle} style={{...valueStyle, textTransform: 'capitalize'}}>
            {destination.vibe}
          </span>
          
          <span style={labelStyle}>LGBTQ+ rating:</span>
          <span style={valueStyle} title={`${destination.lgbtq_rating} out of 5 stars`}>
            {renderStars(destination.lgbtq_rating)} ({destination.lgbtq_rating}/5)
          </span>
        </div>
      </div>
    </div>
  )
}

export default DestinationCard