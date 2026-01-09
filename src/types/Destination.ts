export interface Destination {
  id: string;
  name: string;
  location: {
    city: string;
    state: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  flight_time: number; // in hours from Chicago
  budget_tier: 'budget' | 'mid-range' | 'luxury';
  best_months: string[];
  vibe: string[];
  lgbtq_rating: number; // 1-5 scale
  image_url: string;
  description: string;
  neighborhoods: string[];
  must_do: string[];
  lgbtq_nightlife: string[];
  price_range: {
    min: number;
    max: number;
  };
}

export interface FilterOptions {
  maxFlightTime?: number;
  budgetTier?: string[];
  months?: string[];
  vibes?: string[];
  minLgbtqRating?: number;
}