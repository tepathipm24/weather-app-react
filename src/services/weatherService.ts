import axios from "axios";
import type { WeatherApiResponse } from "../types/weatherTypes";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = `https://api.weatherapi.com/v1`;

// Interface สำหรับ Search API Response
export interface SearchLocation {
  id: number;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  url: string;
}

// Search API สำหรับ autocomplete
export const searchLocations = async (query: string): Promise<SearchLocation[]> => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const response = await axios.get<SearchLocation[]>(`${BASE_URL}/search.json`, {
      params: {
        key: API_KEY,
        q: query.trim(),
      },
    });

    return response.data || [];
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
};

// Enhanced weather data interfaces
export interface ForecastDay {
  date: string;
  date_epoch: number;
  day: {
    maxtemp_c: number;
    maxtemp_f: number;
    mintemp_c: number;
    mintemp_f: number;
    avgtemp_c: number;
    avgtemp_f: number;
    maxwind_kph: number;
    totalprecip_mm: number;
    avghumidity: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    uv: number;
  };
  hour: Array<{
    time_epoch: number;
    time: string;
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_kph: number;
    wind_degree: number;
    wind_dir: string;
    humidity: number;
    feelslike_c: number;
    feelslike_f: number;
    uv: number;
  }>;
}

export interface ForecastResponse extends WeatherApiResponse {
  forecast: {
    forecastday: ForecastDay[];
  };
}

// Specialized data types for different sections
export interface TemperatureData {
  current: number;
  feelsLike: number;
  min: number;
  max: number;
  hourlyForecast: Array<{
    time: string;
    temp: number;
    feelsLike: number;
  }>;
}

export interface WindData {
  speed: number;
  direction: string;
  degree: number;
  gust?: number;
  hourlyForecast: Array<{
    time: string;
    speed: number;
    direction: string;
    degree: number;
  }>;
}

export interface HumidityData {
  current: number;
  level: string;
  hourlyForecast: Array<{
    time: string;
    humidity: number;
  }>;
}

export const getCurrentWeather = async ({ city = 'Bangkok' }: { city?: string }): Promise<WeatherApiResponse> => {
  try {
    const response = await axios.get<WeatherApiResponse>(`${BASE_URL}/current.json`, {
      params: {
        key: API_KEY,
        q: city,
        lang: 'en',
        aqi: 'no',
      },
    });

    // ตรวจสอบว่า response มีข้อมูลครบถ้วน
    if (!response.data || !response.data.current || !response.data.location) {
      throw new Error('Invalid weather data received');
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching weather data: ', error.response?.data || error.message);
      // จัดการ error message ที่ชัดเจน
      const errorMessage = error.response?.data?.error?.message ||
        error.response?.statusText ||
        'Failed to fetch weather data';
      throw new Error(errorMessage);
    }
    console.error('An unexpected error occurred:', error);
    throw new Error('An unexpected error occurred');
  }
};

// Get forecast data with hourly details
export const getForecastWeather = async ({ city = 'Bangkok', days = 3 }: { city?: string; days?: number }): Promise<ForecastResponse> => {
  try {
    const response = await axios.get<ForecastResponse>(`${BASE_URL}/forecast.json`, {
      params: {
        key: API_KEY,
        q: city,
        days: Math.min(days, 10), // API limit is 10 days
        lang: 'en',
        aqi: 'no',
        alerts: 'no',
      },
    });

    if (!response.data || !response.data.current || !response.data.location || !response.data.forecast) {
      throw new Error('Invalid forecast data received');
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching forecast data: ', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error?.message ||
        error.response?.statusText ||
        'Failed to fetch forecast data';
      throw new Error(errorMessage);
    }
    console.error('An unexpected error occurred:', error);
    throw new Error('An unexpected error occurred');
  }
};

// Specialized data fetchers
export const getTemperatureData = async ({ city = 'Bangkok' }: { city?: string }): Promise<TemperatureData> => {
  const forecast = await getForecastWeather({ city, days: 1 });
  const current = forecast.current;
  const today = forecast.forecast.forecastday[0];
  
  return {
    current: current.temp_c,
    feelsLike: current.feelslike_c,
    min: today.day.mintemp_c,
    max: today.day.maxtemp_c,
    hourlyForecast: today.hour.slice(0, 24).map(hour => ({
      time: new Date(hour.time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      temp: hour.temp_c,
      feelsLike: hour.feelslike_c,
    })),
  };
};

export const getWindData = async ({ city = 'Bangkok' }: { city?: string }): Promise<WindData> => {
  const forecast = await getForecastWeather({ city, days: 1 });
  const current = forecast.current;
  const today = forecast.forecast.forecastday[0];
  
  return {
    speed: current.wind_kph,
    direction: current.wind_dir,
    degree: current.wind_degree,
    hourlyForecast: today.hour.slice(0, 24).map(hour => ({
      time: new Date(hour.time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      speed: hour.wind_kph,
      direction: hour.wind_dir,
      degree: hour.wind_degree,
    })),
  };
};

export const getHumidityData = async ({ city = 'Bangkok' }: { city?: string }): Promise<HumidityData> => {
  const forecast = await getForecastWeather({ city, days: 1 });
  const current = forecast.current;
  const today = forecast.forecast.forecastday[0];
  
  const getHumidityLevel = (humidity: number): string => {
    if (humidity < 30) return "แห้ง";
    if (humidity < 50) return "ปกติ";
    if (humidity < 70) return "ชื้น";
    return "ชื้นมาก";
  };
  
  return {
    current: current.humidity,
    level: getHumidityLevel(current.humidity),
    hourlyForecast: today.hour.slice(0, 24).map(hour => ({
      time: new Date(hour.time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      humidity: hour.humidity,
    })),
  };
};