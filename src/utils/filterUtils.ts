import { Destination, FilterCriteria } from '../types/destination';

export function filterDestinations(
  destinations: Destination[],
  criteria: FilterCriteria
): Destination[] {
  return destinations.filter(destination => {
    // Filter by maximum flight time
    if (criteria.max_flight_time && destination.flight_time > criteria.max_flight_time) {
      return false;
    }

    // Filter by budget tier
    if (criteria.budget_tier && destination.budget_tier !== criteria.budget_tier) {
      return false;
    }

    // Filter by month (check if month is in best_months array)
    if (criteria.month && !destination.best_months.includes(criteria.month)) {
      return false;
    }

    // Filter by vibe (check if any of the criteria vibes match destination vibes)
    if (criteria.vibe && criteria.vibe.length > 0) {
      const hasMatchingVibe = criteria.vibe.some(vibe => 
        destination.vibe.includes(vibe)
      );
      if (!hasMatchingVibe) {
        return false;
      }
    }

    // Filter by minimum LGBTQ+ rating
    if (criteria.min_lgbtq_rating && destination.lgbtq_rating < criteria.min_lgbtq_rating) {
      return false;
    }

    return true;
  });
}

export function sortDestinations(
  destinations: Destination[],
  sortBy: 'flight_time' | 'budget' | 'lgbtq_rating' | 'name',
  order: 'asc' | 'desc' = 'asc'
): Destination[] {
  const sorted = [...destinations].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (sortBy) {
      case 'flight_time':
        aValue = a.flight_time;
        bValue = b.flight_time;
        break;
      case 'budget':
        // Convert budget tier to numeric for sorting
        const budgetOrder = { 'budget': 1, 'mid-range': 2, 'luxury': 3 };
        aValue = budgetOrder[a.budget_tier];
        bValue = budgetOrder[b.budget_tier];
        break;
      case 'lgbtq_rating':
        aValue = a.lgbtq_rating;
        bValue = b.lgbtq_rating;
        break;
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
}

export function getUniqueVibes(destinations: Destination[]): string[] {
  const allVibes = destinations.flatMap(dest => dest.vibe);
  return Array.from(new Set(allVibes)).sort();
}