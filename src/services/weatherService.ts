import axios from "axios";
import type { WeatherApiResponse } from "../types/weatherTypes";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = "https://api.weatherapi.com/v1";

// Create axios instance with default config
const weatherApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 second timeout
  params: {
    key: API_KEY,
  },
});

// Add response interceptor for error handling
weatherApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - please check your connection');
    }
    if (error.response?.status === 401) {
      throw new Error('Invalid API key');
    }
    if (error.response?.status === 403) {
      throw new Error('API quota exceeded');
    }
    throw error;
  }
);

// Interface for Search API Response
export interface SearchLocation {
  id: number;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  url: string;
}

// Cache for search results to reduce API calls
const searchCache = new Map<string, { data: SearchLocation[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Optimized search API with caching
export const searchLocations = async (query: string): Promise<SearchLocation[]> => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const trimmedQuery = query.trim().toLowerCase();
  
  // Check cache first
  const cached = searchCache.get(trimmedQuery);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await weatherApi.get<SearchLocation[]>('/search.json', {
      params: { q: trimmedQuery },
    });

    const data = response.data || [];
    
    // Cache the result
    searchCache.set(trimmedQuery, { data, timestamp: Date.now() });
    
    return data;
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

// Cache for weather data
const weatherCache = new Map<string, { data: WeatherApiResponse; timestamp: number }>();
const WEATHER_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export const getCurrentWeather = async ({ city = 'Bangkok' }: { city?: string } = {}): Promise<WeatherApiResponse> => {
  const cacheKey = city.toLowerCase();
  
  // Check cache first
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < WEATHER_CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await weatherApi.get<WeatherApiResponse>('/current.json', {
      params: {
        q: city,
        lang: 'en',
        aqi: 'no',
      },
    });

    // Validate response data
    if (!response.data?.current || !response.data?.location) {
      throw new Error('Invalid weather data received');
    }

    // Cache the result
    weatherCache.set(cacheKey, { data: response.data, timestamp: Date.now() });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error?.message ||
        error.response?.statusText ||
        'Failed to fetch weather data';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

// Cache for forecast data
const forecastCache = new Map<string, { data: ForecastResponse; timestamp: number }>();

// Get forecast data with hourly details
export const getForecastWeather = async ({
  city = 'Bangkok',
  days = 3
}: { city?: string; days?: number } = {}): Promise<ForecastResponse> => {
  const cacheKey = `${city.toLowerCase()}-${days}`;
  
  // Check cache first
  const cached = forecastCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < WEATHER_CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await weatherApi.get<ForecastResponse>('/forecast.json', {
      params: {
        q: city,
        days: Math.min(days, 10), // API limit is 10 days
        lang: 'en',
        aqi: 'no',
        alerts: 'no',
      },
    });

    // Validate response data
    if (!response.data?.current || !response.data?.location || !response.data?.forecast) {
      throw new Error('Invalid forecast data received');
    }

    // Cache the result
    forecastCache.set(cacheKey, { data: response.data, timestamp: Date.now() });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error?.message ||
        error.response?.statusText ||
        'Failed to fetch forecast data';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

// Utility function for time formatting
const formatTime = (timeString: string): string => {
  return new Date(timeString).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Utility function for humidity level
const getHumidityLevel = (humidity: number): string => {
  if (humidity < 30) return "แห้ง";
  if (humidity < 50) return "ปกติ";
  if (humidity < 70) return "ชื้น";
  return "ชื้นมาก";
};

// Specialized data fetchers with optimized data processing
export const getTemperatureData = async ({ city = 'Bangkok' }: { city?: string } = {}): Promise<TemperatureData> => {
  const forecast = await getForecastWeather({ city, days: 1 });
  const { current } = forecast;
  const today = forecast.forecast.forecastday[0];
  
  return {
    current: current.temp_c,
    feelsLike: current.feelslike_c,
    min: today.day.mintemp_c,
    max: today.day.maxtemp_c,
    hourlyForecast: today.hour.map(hour => ({
      time: formatTime(hour.time),
      temp: hour.temp_c,
      feelsLike: hour.feelslike_c,
    })),
  };
};

export const getWindData = async ({ city = 'Bangkok' }: { city?: string } = {}): Promise<WindData> => {
  const forecast = await getForecastWeather({ city, days: 1 });
  const { current } = forecast;
  const today = forecast.forecast.forecastday[0];
  
  return {
    speed: current.wind_kph,
    direction: current.wind_dir,
    degree: current.wind_degree,
    hourlyForecast: today.hour.map(hour => ({
      time: formatTime(hour.time),
      speed: hour.wind_kph,
      direction: hour.wind_dir,
      degree: hour.wind_degree,
    })),
  };
};

export const getHumidityData = async ({ city = 'Bangkok' }: { city?: string } = {}): Promise<HumidityData> => {
  const forecast = await getForecastWeather({ city, days: 1 });
  const { current } = forecast;
  const today = forecast.forecast.forecastday[0];
  
  return {
    current: current.humidity,
    level: getHumidityLevel(current.humidity),
    hourlyForecast: today.hour.map(hour => ({
      time: formatTime(hour.time),
      humidity: hour.humidity,
    })),
  };
};