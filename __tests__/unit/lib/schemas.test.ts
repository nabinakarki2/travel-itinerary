import { placeSchema } from "@/lib/schemas";
import { z } from "zod";

describe("placeSchema", () => {
  const validPlace = {
    name: "Phewa Lake",
    district: "Kaski",
    state: "Gandaki",
    type: "Lake",
    latitude: 28.2096,
    longitude: 83.9456,
  };

  it("validates a correct place object", () => {
    const result = placeSchema.safeParse(validPlace);
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = placeSchema.safeParse({ ...validPlace, name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("name");
    }
  });

  it("rejects missing district", () => {
    const result = placeSchema.safeParse({ ...validPlace, district: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing state", () => {
    const result = placeSchema.safeParse({ ...validPlace, state: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing type", () => {
    const result = placeSchema.safeParse({ ...validPlace, type: "" });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric latitude", () => {
    const result = placeSchema.safeParse({
      ...validPlace,
      latitude: "not-a-number",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric longitude", () => {
    const result = placeSchema.safeParse({
      ...validPlace,
      longitude: "not-a-number",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional description and imageUrl", () => {
    const result = placeSchema.safeParse({
      ...validPlace,
      description: "A beautiful lake",
      imageUrl: "https://example.com/photo.jpg",
    });
    expect(result.success).toBe(true);
  });

  it("accepts place without description and imageUrl", () => {
    const result = placeSchema.safeParse(validPlace);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeUndefined();
      expect(result.data.imageUrl).toBeUndefined();
    }
  });

  it("rejects completely empty object", () => {
    const result = placeSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects null input", () => {
    const result = placeSchema.safeParse(null);
    expect(result.success).toBe(false);
  });
});
