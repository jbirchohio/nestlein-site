import { defineCollection, z } from "astro:content";

const locations = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    address: z.string(),
    phone_number: z.string().optional(),
    best_time_to_work_remotely: z.string().optional(),
    restaurant_score: z.number().optional(),
    tags: z.array(z.string()),
    slug: z.string(),
    logo_url: z.string().optional(),
    remote_work_features: z.object({
      wi_fi_quality: z.string().optional(),
      outlet_access: z.string().optional(),
      noise_level: z.string().optional(),
      seating_comfort: z.string().optional(),
      natural_light: z.string().optional(),
      stay_duration_friendliness: z.string().optional(),
      food_drink_options: z.string().optional(),
      bathroom_access: z.string().optional(),
      parking_availability: z.string().optional(),
    }),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    hours_of_operation: z.string().optional(),
  }),
});

export const collections = {
  locations,
};
