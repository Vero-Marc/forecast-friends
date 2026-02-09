const API_KEY = '53ce1b59148da7451135fb2c7c051df2';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

export async function searchCities(query: string) {
  if (!query) return [];

  const res = await fetch(
    `${GEO_URL}/direct?q=${query}&limit=5&appid=${API_KEY}`
  );

  if (!res.ok) {
    throw new Error('Failed to fetch cities');
  }

  return res.json();
}

// services/cityService.ts
export async function getCityFromCoords(lat: number, lon: number) {
  const res = await fetch(
    `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
  );

  if (!res.ok) throw new Error('Reverse geocoding failed');

  const data = await res.json();
  return data[0];
}
