import { City, WeatherData } from '@/types/weather';

import { WeatherAlert } from '@/types/weather';
export function mapToCity(apiCity: any): City {
  return {
    id: `${apiCity.lat}-${apiCity.lon}`,
    name: apiCity.name,
    country: apiCity.country,
    lat: apiCity.lat,
    lon: apiCity.lon,
  };
}

// utils/mapWeather.ts
export function mapToWeatherData(apiData: any): WeatherData {
  return {
    id: apiData.id.toString(),
    city: apiData.name,
    country: apiData.sys.country,
    temperature: Math.round(apiData.main.temp),
    feelsLike: Math.round(apiData.main.feels_like),
    humidity: apiData.main.humidity,
    windSpeed: apiData.wind.speed,
    condition: apiData.weather[0].main.toLowerCase(),
    description: apiData.weather[0].description,
    high: Math.round(apiData.main.temp_max),
    low: Math.round(apiData.main.temp_min),
    uvIndex: 0,
    visibility: apiData.visibility / 1000,
    pressure: apiData.main.pressure,
    sunrise: new Date(apiData.sys.sunrise * 1000).toLocaleTimeString(),
    sunset: new Date(apiData.sys.sunset * 1000).toLocaleTimeString(),
  };
}

// utils/mapAlerts.ts
export function mapToWeatherAlerts(apiAlerts: any[], city?: City[]): WeatherAlert[] {
  if (!apiAlerts) return [];

  return apiAlerts.map((alert, index) => ({
    id: String(index),
    type: 'warning',
    title: alert.event,
    description: alert.description,
    severity:alert.severity || 'medium',
    cities: city ? city.map(c => c.name) : [],
    expiresAt: new Date(alert.end * 1000).toISOString(),
    start: new Date(alert.start * 1000).toLocaleString(),
    end: new Date(alert.end * 1000).toLocaleString(),
  }));
}

