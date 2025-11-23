export type Weather = {
  _id: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  location?: { lat: number; lon: number };
  createdAt?: string;
  updatedAt?: string;
};
