import { z } from "zod";

export const placeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  district: z.string().min(1, "District is required"),
  state: z.string().min(1, "State is required"),
  type: z.string().min(1, "Type is required"),
  latitude: z.number(),
  longitude: z.number(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

export type AddPlaceInput = z.infer<typeof placeSchema>;
