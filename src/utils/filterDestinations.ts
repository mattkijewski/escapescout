import { Destination, FilterCriteria } from '../types/destination';

export const filterDestinations = (
  destinations: Destination[],
  criteria: FilterCriteria
): Destination[] => {
  return destinations.filter((destination) => {
    // Filter by maximum flight time
    if (criteria.max_flight_time && destination.flight_time > criteria.max_flight_time) {
      return false;
    }

    // Filter by budget tier
    if (criteria.budget_tier && criteria.budget_tier.length > 0) {
      if (!criteria.budget_tier.includes(destination.budget_tier)) {
        return false;
      }
    }

    // Filter by months
    if (criteria.months && criteria.months.length > 0) {
      const hasMatchingMonth = criteria.months.some(month => 
        destination.best_months.includes(month)
      );
      if (!hasMatchingMonth) {
        return false;
      }
    }

    // Filter by vibes
    if (criteria.vibes && criteria.vibes.length > 0) {
      const hasMatchingVibe = criteria.vibes.some(vibe => 
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
};