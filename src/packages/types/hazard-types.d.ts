export interface Hazard {
    severity: string;
    type: string;
    name: string;
    latitude: number;
    longitude: number;
    created: string;
    lastUpdate: string;
  }
  
  export interface HazardResponse {
    statusCode: string;
    body: {
      hazards: Hazard[];
    };
  }