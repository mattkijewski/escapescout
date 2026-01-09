export interface Destination {
  id: string;
  name: string;
  location: string;
  flight_time: number; // hours from Chicago
  budget_tier: 'budget' | 'mid' | 'luxury';
  best_months: string[];
  vibe: string[];
  lgbtq_rating: number; // 1-5 scale
  image_url: string;
  description: string;
  neighborhoods: string[];
  must_do: string[];
  lgbtq_nightlife: string[];
}

export interface FilterCriteria {
  max_flight_time?: number;
  budget_tiers?: string[];
  months?: string[];
  vibes?: string[];
  min_lgbtq_rating?: number;
}