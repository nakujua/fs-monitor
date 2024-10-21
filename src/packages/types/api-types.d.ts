// Type definitions for the Food Consumption Score (FCS) API response
export interface FoodSecurityResponse {
    statusCode: string;
    body: FoodSecurityBody;
  }
  
  export interface FoodSecurityBody {
    country: CountryInfo;
    date: string;
    dataType: string;
    metrics: Metrics;
  }
  
  export interface CountryInfo {
    id: number;
    name: string;
    iso3: string;
    iso2: string;
  }
  
  export interface Metrics {
    fcs: MetricDetail;
    rcsi: MetricDetail;
    healthAccess: MetricDetail;
    marketAccess: MetricDetail;
  }
  
  export interface MetricDetail {
    people: number;
    prevalence: number;
  }
  
  // Type definitions for the IPC API response (Placeholder)
  export interface IPCResponse {
    // Define the structure of the IPC data when known
  }
  
  // Type definitions for Hazards API response (Placeholder)
  export interface HazardsResponse {
    // Define the structure of the Hazards data when known
  }
  