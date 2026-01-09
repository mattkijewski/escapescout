export interface Destination {
  id: string;
  name: string;
  location: {
    city: string;
    state?: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  flight_time: number; // in hours from Chicago
  budget_tier: 'budget' | 'mid-range' | 'luxury';
  best_months: number[]; // 1-12 representing months
  vibe: string[];
  lgbtq_rating: number; // 1-5 scale
  image_url: string;
  description: string;
  neighborhoods: string[];
  must_do: string[];
  lgbtq_nightlife: string;
  estimated_cost: {
    budget: number;
    mid_range: number;
    luxury: number;
  };
}

export interface FilterCriteria {
  max_flight_time?: number;
  budget_tier?: 'budget' | 'mid-range' | 'luxury';
  month?: number;
  vibe?: string[];
  min_lgbtq_rating?: number;
}