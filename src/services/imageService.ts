// services/imageService.ts
const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_KEY'; // get from https://unsplash.com/developers

export async function fetchBackgroundImage(weatherCondition: string): Promise<string> {
  // Map weather to search queries
  const queryMap: Record<string, string> = {
    sunny: 'sunny sky',
    cloudy: 'cloudy sky',
    partlyCloudy: 'partly cloudy sky',
    rain: 'rainy sky',
    storm: 'storm clouds',
    snow: 'snow landscape',
    fog: 'foggy weather',
    default: 'weather landscape',
  };

  const query = queryMap[weatherCondition] || queryMap['default'];

  const res = await fetch(
    `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`
  );

  if (!res.ok) throw new Error('Failed to fetch image');

  const data = await res.json();
  return data.urls.full; // full resolution image
}
