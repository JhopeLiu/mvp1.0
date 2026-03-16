export interface TemperatureRange {
  min: number;
  max: number;
}

export interface WeddingDateRequest {
  city: string;
  groomZodiac: string;
  brideZodiac: string;
  preferredTemperatureRange: TemperatureRange;
}

export interface WeddingDateResponse {
  message: string;
  recommendation: {
    suggestedDate: string;
    rationale: string;
  };
  receivedInput: WeddingDateRequest;
}
