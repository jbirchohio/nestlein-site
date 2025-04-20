// src/types/location.ts

export type Location = {
  name: string;
  address: string;
  hours?: string;
  phone_number?: string;
  logo_url?: string;
  website?: string;
  menu_url?: string;
  review_score?: number;
  review_count?: number;
  tags?: string[];
  best_time_to_work_remotely?: string;
  remote_work_summary?: string;
  scores?: {
    food_quality?: number;
    service?: number;
    ambiance?: number;
    value?: number;
    experience?: number;
  };
  remote_work_features?: {
    wi_fi_quality?: string;
    outlet_access?: string;
    noise_level?: string;
    seating_comfort?: string;
    natural_light?: string;
    stay_duration_friendliness?: string;
    food_drink_options?: string;
    bathroom_access?: string;
    parking_availability?: string;
  };
};
