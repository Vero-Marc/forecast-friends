export interface WeatherData {
  id: string;
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: WeatherCondition;
  description: string;
  high: number;
  low: number;
  uvIndex: number;
  visibility: number;
  pressure: number;
  sunrise: string;
  sunset: string;
}

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'partly-cloudy';

export interface WeatherAlert {
  id: string;
  type: 'warning' | 'watch' | 'advisory';
  title: string;
  description: string;
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  cities: string[];
  expiresAt: string;
}

export interface WeatherAdvice {
  icon: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}
