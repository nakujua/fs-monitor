export interface FoodSecurityResponse {
    statusCode: string;
    body: {
      country: {
        id: number;
        name: string;
        iso3: string;
        iso2: string;
      };
      date: string;
      dataType: string;
      metrics: {
        fcs: {
          people: number;
          prevalence: number;
        };
        rcsi: {
          people: number;
          prevalence: number;
        };
        healthAccess: {
          people: number;
          prevalence: number;
        };
        marketAccess: {
          people: number;
          prevalence: number;
        };
      };
    };
  }
  