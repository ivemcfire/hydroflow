import { Request, Response } from 'express';

// Antonovo, Bulgaria — 7978
const LAT = 43.15;
const LON = 26.17;
const TIMEZONE = 'Europe/Sofia';

const WMO_CONDITION: Record<number, string> = {
  0: 'clear',
  1: 'clear', 2: 'partly_cloudy', 3: 'cloudy',
  45: 'cloudy', 48: 'cloudy',
  51: 'rain', 53: 'rain', 55: 'rain',
  61: 'rain', 63: 'rain', 65: 'rain',
  71: 'snow', 73: 'snow', 75: 'snow', 77: 'snow',
  80: 'rain', 81: 'rain', 82: 'rain',
  85: 'snow', 86: 'snow',
  95: 'thunder', 96: 'thunder', 99: 'thunder',
};

function mapCondition(code: number): string {
  return WMO_CONDITION[code] ?? 'cloudy';
}

export const getWeather = async (_req: Request, res: Response) => {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${LAT}&longitude=${LON}` +
      `&current=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,weather_code` +
      `&daily=weather_code,temperature_2m_max` +
      `&timezone=${encodeURIComponent(TIMEZONE)}` +
      `&forecast_days=7`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Open-Meteo error: ${response.status}`);
    const data: any = await response.json();

    const cur = data.current;
    const daily = data.daily;

    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    res.json({
      location: 'Antonovo, BG',
      temperature: Math.round(cur.temperature_2m),
      humidity: cur.relative_humidity_2m,
      precipitation: cur.precipitation_probability,
      windSpeed: Math.round(cur.wind_speed_10m),
      condition: mapCondition(cur.weather_code),
      forecast: (daily.time as string[]).map((date: string, i: number) => ({
        day: DAYS[new Date(date).getUTCDay()],
        temp: `${Math.round(daily.temperature_2m_max[i])}°`,
        condition: mapCondition(daily.weather_code[i]),
      })),
    });
  } catch (err: any) {
    console.error('Weather fetch error:', err.message);
    res.status(502).json({ error: 'Weather service unavailable' });
  }
};
