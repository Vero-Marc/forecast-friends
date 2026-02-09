const API_KEY = '53ce1b59148da7451135fb2c7c051df2';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const ONE_CALL_URL = 'https://api.openweathermap.org/data/3.0/onecall';

export async function fetchWeatherByCoords(lat: number, lon: number) {
  const res = await fetch(
    `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
  );

  if (!res.ok) throw new Error('Failed to fetch weather');

  return res.json();
}

export async function fetchWeatherAlerts(lat: number, lon: number) {
  const res = await fetch(
    `${ONE_CALL_URL}?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily&appid=${API_KEY}`
  );

  if (!res.ok) throw new Error('Failed to fetch alerts');

  return res.json();
}

