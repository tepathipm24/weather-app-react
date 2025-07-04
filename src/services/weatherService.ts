import axios from "axios";
import type { WeatherApiResponse } from "../types/weatherTypes";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = `https://api.weatherapi.com/v1/current.json`;

interface GetWeatherParams {
  city: string;
  lang?: string;
}

export const getCurrentWeather = async ({
  city,
  lang = "en",
}: GetWeatherParams): Promise<WeatherApiResponse> => {
    try {
        const respone = await axios.get<any>(BASE_URL, {
            params: {
                key: API_KEY,
                q: city,
                lang: lang,
                aqi: 'no'
            }
        })

        return respone.data.current;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching weather data: ', error.response?.data || error.message)
            throw new Error(error.response?.data?.error?.message || 'Failed to fetch weather data')
        }
        console.error('An unexpected error occurred:', error);
        throw new Error('An unexpected error occurred')
    }
};
