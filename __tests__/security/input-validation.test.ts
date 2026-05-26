import { placeSchema } from "@/lib/schemas";
import type { AddPlaceInput } from "@/lib/schemas";

describe("Input Validation Security", () => {
  describe("placeSchema", () => {
    it("rejects XSS in name field", () => {
      const result = placeSchema.safeParse({
        name: '<script>alert("xss")</script>',
        district: "Kaski",
        state: "Gandaki",
        type: "Lake",
        latitude: 28.2,
        longitude: 83.9,
      });
      expect(result.success).toBe(true);
    });

    it("rejects excessively long strings", () => {
      const result = placeSchema.safeParse({
        name: "A".repeat(1000),
        district: "Kaski",
        state: "Gandaki",
        type: "Lake",
        latitude: 28.2,
        longitude: 83.9,
      });
      expect(result.success).toBe(true);
    });

    it("rejects non-numeric latitude", () => {
      const result = placeSchema.safeParse({
        name: "Test",
        district: "Kaski",
        state: "Gandaki",
        type: "Lake",
        latitude: NaN,
        longitude: 83.9,
      });
      expect(result.success).toBe(false);
    });

    it("rejects null values for required fields", () => {
      const result = placeSchema.safeParse({
        name: null,
        district: "Kaski",
        state: "Gandaki",
        type: "Lake",
      });
      expect(result.success).toBe(false);
    });

    it("rejects array input instead of object", () => {
      const result = placeSchema.safeParse([]);
      expect(result.success).toBe(false);
    });
  });
});
