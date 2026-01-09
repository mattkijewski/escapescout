import { filterDestinations, getUniqueVibes } from './filterUtils';
import { Destination } from '../types/destination';

const mockDestinations: Destination[] = [
  {
    id: '1',
    name: 'Test City 1',
    location: {
      city: 'Test',
      state: 'TX',
      country: 'USA',
      coordinates: { lat: 0, lng: 0 }
    },
    flight_time: { from_chicago: 2 },
    budget_tier: 'mid',
    best_months: [5, 6, 7],
    vibe: ['urban', 'nightlife'],
    lgbtq_rating: 4,
    image_url: '/test.jpg',
    description: 'Test destination',
    neighborhoods: ['Test Area'],
    must_do: ['Test Activity'],
    lgbtq_nightlife_notes: 'Test notes'
  },
  {
    id: '2',
    name: 'Test City 2',
    location: {
      city: 'Test2',
      state: 'CA',
      country: 'USA',
      coordinates: { lat: 0, lng: 0 }
    },
    flight_time: { from_chicago: 5 },
    budget_tier: 'luxury',
    best_months: [10, 11, 12],
    vibe: ['beach', 'relaxing'],
    lgbtq_rating: 3,
    image_url: '/test2.jpg',
    description: 'Test destination 2',
    neighborhoods: ['Beach Area'],
    must_do: ['Beach Activity'],
    lgbtq_nightlife_notes: 'Test notes 2'
  }
];

describe('filterDestinations', () => {
  test('filters by flight time', () => {
    const result = filterDestinations(mockDestinations, { maxFlightTime: 3 });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  test('filters by budget tier', () => {
    const result = filterDestinations(mockDestinations, { budgetTiers: ['luxury'] });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  test('filters by month', () => {
    const result = filterDestinations(mockDestinations, { months: [6] });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  test('filters by vibe', () => {
    const result = filterDestinations(mockDestinations, { vibes: ['beach'] });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  test('filters by LGBTQ rating', () => {
    const result = filterDestinations(mockDestinations, { minLgbtqRating: 4 });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  test('returns all destinations with no filters', () => {
    const result = filterDestinations(mockDestinations, {});
    expect(result).toHaveLength(2);
  });

  test('returns empty array when no destinations match', () => {
    const result = filterDestinations(mockDestinations, { maxFlightTime: 1 });
    expect(result).toHaveLength(0);
  });
});

describe('getUniqueVibes', () => {
  test('returns unique vibes sorted', () => {
    const result = getUniqueVibes(mockDestinations);
    expect(result).toEqual(['beach', 'nightlife', 'relaxing', 'urban']);
  });
});