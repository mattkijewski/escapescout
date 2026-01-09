import { Destination, FilterCriteria } from '../types/destination';

export function filterDestinations(
  destinations: Destination[],
  criteria: FilterCriteria
): Destination[] {
  return destinations.filter(destination => {
    // Filter by maximum flight time
    if (criteria.max_flight_time !== undefined && 
        destination.flight_time > criteria.max_flight_time) {
      return false;
    }

    // Filter by budget tiers
    if (criteria.budget_tiers && criteria.budget_tiers.length > 0 &&
        !criteria.budget_tiers.includes(destination.budget_tier)) {
      return false;
    }

    // Filter by months (check if any of the destination's best months match filter)
    if (criteria.months && criteria.months.length > 0) {
      const hasMatchingMonth = destination.best_months.some(month =>
        criteria.months!.includes(month)
      );
      if (!hasMatchingMonth) {
        return false;
      }
    }

    // Filter by vibes (check if destination has any of the requested vibes)
    if (criteria.vibes && criteria.vibes.length > 0) {
      const hasMatchingVibe = destination.vibe.some(vibe =>
        criteria.vibes!.includes(vibe)
      );
      if (!hasMatchingVibe) {
        return false;
      }
    }

    // Filter by minimum LGBTQ+ rating
    if (criteria.min_lgbtq_rating !== undefined &&
        destination.lgbtq_rating < criteria.min_lgbtq_rating) {
      return false;
    }

    return true;
  });
}

export function sortDestinations(
  destinations: Destination[],
  sortBy: 'flight_time' | 'lgbtq_rating' | 'name' = 'flight_time'
): Destination[] {
  return [...destinations].sort((a, b) => {
    switch (sortBy) {
      case 'flight_time':
        return a.flight_time - b.flight_time;
      case 'lgbtq_rating':
        return b.lgbtq_rating - a.lgbtq_rating;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });
}

export function getUniqueValues<T extends keyof Destination>(
  destinations: Destination[],
  field: T
): Destination[T][] {
  const values = destinations.flatMap(dest => 
    Array.isArray(dest[field]) ? dest[field] as any : [dest[field]]
  );
  return [...new Set(values)].sort();
}