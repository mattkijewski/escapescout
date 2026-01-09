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
  flight_time: {
    from_chicago: number; // hours
  };
  budget_tier: 'budget' | 'mid' | 'luxury';
  best_months: number[]; // 1-12 representing months
  vibe: string[];
  lgbtq_rating: number; // 1-5 scale
  image_url: string;
  description: string;
  neighborhoods: string[];
  must_do: string[];
  lgbtq_nightlife_notes: string;
}

export interface FilterCriteria {
  maxFlightTime?: number;
  budgetTiers?: string[];
  months?: number[];
  vibes?: string[];
  minLgbtqRating?: number;
}