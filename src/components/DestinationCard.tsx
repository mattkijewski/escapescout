import React from 'react';
import { Destination } from '../types/destination';

interface DestinationCardProps {
  destination: Destination;
  onViewDetails: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  onViewDetails,
  onToggleFavorite,
  isFavorite
}) => {
  const formatBudgetTier = (tier: string): string => {
    const symbols = {
      budget: '$',
      mid: '$$',
      luxury: '$$$'
    };
    return symbols[tier as keyof typeof symbols] || tier;
  };

  const formatMonths = (months: number[]): string => {
    const monthNames = [
      '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    if (months.length <= 3) {
      return months.map(m => monthNames[m]).join(', ');
    } else if (months.length >= 6) {
      return 'Year-round';
    } else {
      return `${monthNames[months[0]]} - ${monthNames[months[months.length - 1]]}`;
    }
  };

  return (
    <div className="destination-card">
      <div className="card-image">
        <img 
          src={destination.image_url} 
          alt={destination.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
          }}
        />
        <button 
          className={`favorite-btn ${isFavorite ? 'favorite' : ''}`}
          onClick={() => onToggleFavorite(destination.id)}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          ♥
        </button>
      </div>
      
      <div className="card-content">
        <h3>{destination.name}</h3>
        <p className="location">{destination.location.city}, {destination.location.state}</p>
        
        <div className="card-details">
          <div className="detail-item">
            <span className="label">Flight time:</span>
            <span>{destination.flight_time.from_chicago}h</span>
          </div>
          
          <div className="detail-item">
            <span className="label">Budget:</span>
            <span>{formatBudgetTier(destination.budget_tier)}</span>
          </div>
          
          <div className="detail-item">
            <span className="label">Best time:</span>
            <span>{formatMonths(destination.best_months)}</span>
          </div>
          
          <div className="detail-item">
            <span className="label">LGBTQ+ friendly:</span>
            <span>{'★'.repeat(destination.lgbtq_rating)}{'☆'.repeat(5 - destination.lgbtq_rating)}</span>
          </div>
        </div>
        
        <div className="vibe-tags">
          {destination.vibe.slice(0, 3).map(vibe => (
            <span key={vibe} className="vibe-tag">{vibe}</span>
          ))}
        </div>
        
        <button 
          className="view-details-btn"
          onClick={() => onViewDetails(destination.id)}
        >
          View Details
        </button>
      </div>
    </div>
  );
};