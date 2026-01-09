import { Destination } from '../types/destination';

export const destinations: Destination[] = [
  {
    id: '1',
    name: 'New York City',
    location: {
      city: 'New York',
      state: 'NY',
      country: 'USA',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    flight_time: { from_chicago: 2.5 },
    budget_tier: 'luxury',
    best_months: [4, 5, 6, 9, 10, 11],
    vibe: ['urban', 'cultural', 'nightlife', 'diverse'],
    lgbtq_rating: 5,
    image_url: '/images/nyc.jpg',
    description: 'The city that never sleeps offers endless possibilities for a weekend getaway.',
    neighborhoods: ['Greenwich Village', 'SoHo', 'Chelsea', 'Hell\'s Kitchen'],
    must_do: ['Broadway Show', 'Central Park', 'High Line', 'Museums'],
    lgbtq_nightlife_notes: 'World-class LGBTQ+ scene in Greenwich Village and Chelsea with iconic bars and clubs.'
  },
  {
    id: '2',
    name: 'Nashville',
    location: {
      city: 'Nashville',
      state: 'TN',
      country: 'USA',
      coordinates: { lat: 36.1627, lng: -86.7816 }
    },
    flight_time: { from_chicago: 1.5 },
    budget_tier: 'mid',
    best_months: [3, 4, 5, 9, 10, 11],
    vibe: ['music', 'nightlife', 'southern', 'friendly'],
    lgbtq_rating: 4,
    image_url: '/images/nashville.jpg',
    description: 'Music City combines honky-tonk bars with incredible live music venues.',
    neighborhoods: ['The Gulch', 'Music Row', 'Downtown', 'East Nashville'],
    must_do: ['Country Music Hall of Fame', 'Broadway Honky-tonks', 'Grand Ole Opry', 'Distillery Tours'],
    lgbtq_nightlife_notes: 'Growing LGBTQ+ scene with welcoming venues in East Nashville and downtown.'
  },
  {
    id: '3',
    name: 'Austin',
    location: {
      city: 'Austin',
      state: 'TX',
      country: 'USA',
      coordinates: { lat: 30.2672, lng: -97.7431 }
    },
    flight_time: { from_chicago: 2.5 },
    budget_tier: 'mid',
    best_months: [3, 4, 5, 10, 11, 12],
    vibe: ['music', 'foodie', 'quirky', 'outdoor'],
    lgbtq_rating: 4,
    image_url: '/images/austin.jpg',
    description: 'Keep Austin Weird - live music capital with amazing food scene.',
    neighborhoods: ['South by Southwest', '6th Street', 'Rainey Street', 'East Austin'],
    must_do: ['Live Music Venues', 'Food Trucks', 'Lady Bird Lake', 'South by Southwest'],
    lgbtq_nightlife_notes: 'Vibrant LGBTQ+ community with great bars and events, especially during Pride and SXSW.'
  },
  {
    id: '4',
    name: 'Denver',
    location: {
      city: 'Denver',
      state: 'CO',
      country: 'USA',
      coordinates: { lat: 39.7392, lng: -104.9903 }
    },
    flight_time: { from_chicago: 2 },
    budget_tier: 'mid',
    best_months: [5, 6, 7, 8, 9, 10],
    vibe: ['outdoor', 'adventure', 'craft-beer', 'mountains'],
    lgbtq_rating: 4,
    image_url: '/images/denver.jpg',
    description: 'Mile High City with stunning mountain views and craft beer scene.',
    neighborhoods: ['LoDo', 'RiNo', 'Capitol Hill', 'Highlands'],
    must_do: ['Red Rocks Amphitheatre', 'Craft Brewery Tours', 'Rocky Mountain Day Trip', 'Art District'],
    lgbtq_nightlife_notes: 'Strong LGBTQ+ community centered in Capitol Hill with diverse bars and events.'
  },
  {
    id: '5',
    name: 'Portland',
    location: {
      city: 'Portland',
      state: 'OR',
      country: 'USA',
      coordinates: { lat: 45.5152, lng: -122.6784 }
    },
    flight_time: { from_chicago: 4 },
    budget_tier: 'mid',
    best_months: [5, 6, 7, 8, 9],
    vibe: ['quirky', 'foodie', 'craft-beer', 'eco-friendly'],
    lgbtq_rating: 5,
    image_url: '/images/portland.jpg',
    description: 'Keep Portland Weird - food truck paradise with amazing coffee culture.',
    neighborhoods: ['Pearl District', 'Hawthorne', 'Alberta', 'Sellwood'],
    must_do: ['Food Truck Pods', 'Powell\'s Books', 'Brewery Tours', 'Saturday Market'],
    lgbtq_nightlife_notes: 'Very LGBTQ+ friendly city with inclusive venues throughout all neighborhoods.'
  },
  {
    id: '6',
    name: 'Miami',
    location: {
      city: 'Miami',
      state: 'FL',
      country: 'USA',
      coordinates: { lat: 25.7617, lng: -80.1918 }
    },
    flight_time: { from_chicago: 3 },
    budget_tier: 'luxury',
    best_months: [11, 12, 1, 2, 3, 4],
    vibe: ['beach', 'nightlife', 'art', 'tropical'],
    lgbtq_rating: 4,
    image_url: '/images/miami.jpg',
    description: 'Art Deco architecture meets tropical vibes and world-class nightlife.',
    neighborhoods: ['South Beach', 'Wynwood', 'Little Havana', 'Design District'],
    must_do: ['South Beach', 'Art Deco Walking Tour', 'Wynwood Walls', 'Cuban Food'],
    lgbtq_nightlife_notes: 'Great LGBTQ+ scene in South Beach and downtown with beach clubs and rooftop bars.'
  },
  {
    id: '7',
    name: 'San Francisco',
    location: {
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      coordinates: { lat: 37.7749, lng: -122.4194 }
    },
    flight_time: { from_chicago: 4.5 },
    budget_tier: 'luxury',
    best_months: [9, 10, 11, 4, 5],
    vibe: ['urban', 'diverse', 'tech', 'progressive'],
    lgbtq_rating: 5,
    image_url: '/images/sf.jpg',
    description: 'Iconic city by the bay with historic LGBTQ+ heritage and tech innovation.',
    neighborhoods: ['Castro', 'Mission', 'Haight-Ashbury', 'North Beach'],
    must_do: ['Golden Gate Bridge', 'Alcatraz', 'Castro District', 'Pier 39'],
    lgbtq_nightlife_notes: 'Historic birthplace of LGBTQ+ rights movement with legendary Castro District scene.'
  },
  {
    id: '8',
    name: 'New Orleans',
    location: {
      city: 'New Orleans',
      state: 'LA',
      country: 'USA',
      coordinates: { lat: 29.9511, lng: -90.0715 }
    },
    flight_time: { from_chicago: 2.5 },
    budget_tier: 'mid',
    best_months: [10, 11, 12, 1, 2, 3, 4],
    vibe: ['cultural', 'music', 'foodie', 'historic'],
    lgbtq_rating: 4,
    image_url: '/images/nola.jpg',
    description: 'Jazz, Creole cuisine, and unique cultural blend make NOLA unforgettable.',
    neighborhoods: ['French Quarter', 'Marigny', 'Garden District', 'Warehouse District'],
    must_do: ['Jazz Clubs', 'Beignets at Cafe du Monde', 'Cemetery Tours', 'Bourbon Street'],
    lgbtq_nightlife_notes: 'Welcoming LGBTQ+ scene with historic bars in French Quarter and trendy spots in Marigny.'
  },
  {
    id: '9',
    name: 'Seattle',
    location: {
      city: 'Seattle',
      state: 'WA',
      country: 'USA',
      coordinates: { lat: 47.6062, lng: -122.3321 }
    },
    flight_time: { from_chicago: 4 },
    budget_tier: 'mid',
    best_months: [6, 7, 8, 9],
    vibe: ['outdoor', 'coffee', 'tech', 'grunge'],
    lgbtq_rating: 5,
    image_url: '/images/seattle.jpg',
    description: 'Coffee culture meets outdoor adventure with stunning mountain and water views.',
    neighborhoods: ['Capitol Hill', 'Fremont', 'Ballard', 'Pike Place'],
    must_do: ['Pike Place Market', 'Space Needle', 'Coffee Shop Tours', 'Ferry Rides'],
    lgbtq_nightlife_notes: 'Very LGBTQ+ friendly with Capitol Hill as the historic gayborhood and great scene citywide.'
  },
  {
    id: '10',
    name: 'Boston',
    location: {
      city: 'Boston',
      state: 'MA',
      country: 'USA',
      coordinates: { lat: 42.3601, lng: -71.0589 }
    },
    flight_time: { from_chicago: 2.5 },
    budget_tier: 'mid',
    best_months: [4, 5, 6, 9, 10],
    vibe: ['historic', 'walkable', 'academic', 'sports'],
    lgbtq_rating: 4,
    image_url: '/images/boston.jpg',
    description: 'Historic charm meets modern innovation in this walkable city.',
    neighborhoods: ['Back Bay', 'North End', 'South End', 'Cambridge'],
    must_do: ['Freedom Trail', 'Fenway Park', 'Harvard/MIT', 'Italian Food in North End'],
    lgbtq_nightlife_notes: 'Good LGBTQ+ scene in South End and Jamaica Plain with historic and trendy venues.'
  }
];