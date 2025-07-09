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