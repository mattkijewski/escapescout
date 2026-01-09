export type BudgetTier = 'budget' | 'mid-range' | 'luxury';
export type Vibe = 'adventure' | 'culture' | 'relaxation' | 'nightlife' | 'foodie' | 'nature';
export type LGBTQRating = 1 | 2 | 3 | 4 | 5;

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
  budget_tier: BudgetTier;
  best_months: string[]; // array of month names
  vibe: Vibe[];
  lgbtq_rating: LGBTQRating;
  description: string;
  image_url: string;
  neighborhoods?: string[];
  must_do?: string[];
  lgbtq_nightlife?: string[];
  weekend_itinerary?: {
    friday: string[];
    saturday: string[];
    sunday: string[];
  };
}

export interface FilterCriteria {
  max_flight_time?: number;
  budget_tiers?: BudgetTier[];
  months?: string[];
  vibes?: Vibe[];
  min_lgbtq_rating?: LGBTQRating;
}