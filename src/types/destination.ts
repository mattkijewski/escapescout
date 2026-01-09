export interface Destination {
  id: string;
  name: string;
  location: string;
  flight_time: number; // in hours
  budget_tier: 'budget' | 'mid-range' | 'luxury';
  best_months: string[];
  vibe: string[];
  lgbtq_rating: number; // 1-5 scale
  image_url: string;
  description: string;
  neighborhoods: string[];
  must_do: string[];
  lgbtq_nightlife: string;
  price_range: string;
}

export interface FilterOptions {
  maxFlightTime?: number;
  budgetTier?: 'budget' | 'mid-range' | 'luxury';
  month?: string;
  vibe?: string;
  minLgbtqRating?: number;
}