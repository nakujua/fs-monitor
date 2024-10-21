export interface CountryInfo {
    country: {
      id: number;
      name: string;
      iso3: string;
      iso2: string;
    };
    population: {
      number: number;
      year: string;
      source: string;
    };
    chronic_hunger: number | null;
    malnutrition: number | null;
    income_group: {
      level: string;
    };
  }
  
  // Define the structure of the full API response
  export interface CountryInfoResponse {
    statusCode: string;
    body: {
      countries: CountryInfo[];
    };
  }
  
  // Define the state type for GeoJSON data
  import { FeatureCollection } from "geojson";
  export type GeoJsonFeatureCollection = FeatureCollection;
  