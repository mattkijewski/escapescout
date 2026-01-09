import { Destination, FilterCriteria } from '../types/destination';

export const filterDestinations = (
  destinations: Destination[],
  criteria: FilterCriteria
): Destination[] => {
  return destinations.filter(destination => {
    // Flight time filter
    if (criteria.maxFlightTime && destination.flight_time.from_chicago > criteria.maxFlightTime) {
      return false;
    }

    // Budget tier filter
    if (criteria.budgetTiers && criteria.budgetTiers.length > 0) {
      if (!criteria.budgetTiers.includes(destination.budget_tier)) {
        return false;
      }
    }

    // Month filter
    if (criteria.months && criteria.months.length > 0) {
      const hasMatchingMonth = criteria.months.some(month => 
        destination.best_months.includes(month)
      );
      if (!hasMatchingMonth) {
        return false;
      }
    }

    // Vibe filter
    if (criteria.vibes && criteria.vibes.length > 0) {
      const hasMatchingVibe = criteria.vibes.some(vibe => 
        destination.vibe.includes(vibe)
      );
      if (!hasMatchingVibe) {
        return false;
      }
    }

    // LGBTQ+ rating filter
    if (criteria.minLgbtqRating && destination.lgbtq_rating < criteria.minLgbtqRating) {
      return false;
    }

    return true;
  });
};

export const getUniqueVibes = (destinations: Destination[]): string[] => {
  const allVibes = destinations.flatMap(destination => destination.vibe);
  return [...new Set(allVibes)].sort();
};

export const getBudgetTiers = (): string[] => {
  return ['budget', 'mid', 'luxury'];
};

export const getMonthNames = (): { value: number; label: string }[] => {
  return [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];
};