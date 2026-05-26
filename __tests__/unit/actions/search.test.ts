import { searchPlaces } from "@/actions/search";

jest.mock("@/lib/gemini", () => ({
  generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
}));

jest.mock("@/lib/astra", () => ({
  searchSimilarPlaces: jest.fn(),
}));

const mockSearchSimilarPlaces = jest.requireMock(
  "@/lib/astra",
).searchSimilarPlaces;

describe("searchPlaces", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns mapped place results", async () => {
    mockSearchSimilarPlaces.mockResolvedValue([
      {
        place_id: 1,
        name: "Phewa Lake",
        description: "A beautiful lake",
        district: "Kaski",
        state: "Gandaki",
        type: "Lake",
        latitude: 28.2096,
        longitude: 83.9456,
        $similarity: 0.95,
      },
    ]);
    const results = await searchPlaces("lake");
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Phewa Lake");
    expect(results[0].$similarity).toBe(0.95);
  });

  it("returns empty array when no matches found", async () => {
    mockSearchSimilarPlaces.mockResolvedValue([]);
    const results = await searchPlaces("unknown query");
    expect(results).toEqual([]);
  });

  it("calls search with default limit of 5", async () => {
    mockSearchSimilarPlaces.mockResolvedValue([]);
    await searchPlaces("test");
    expect(mockSearchSimilarPlaces).toHaveBeenCalledWith(
      [0.1, 0.2, 0.3],
      5,
    );
  });

  it("respects custom limit parameter", async () => {
    mockSearchSimilarPlaces.mockResolvedValue([]);
    await searchPlaces("test", 10);
    expect(mockSearchSimilarPlaces).toHaveBeenCalledWith(
      [0.1, 0.2, 0.3],
      10,
    );
  });

  it("handles missing optional fields gracefully", async () => {
    mockSearchSimilarPlaces.mockResolvedValue([
      {
        place_id: 1,
        name: "Place",
        description: "Desc",
      },
    ]);
    const results = await searchPlaces("place");
    expect(results[0].district).toBeUndefined();
    expect(results[0].latitude).toBeUndefined();
  });

  it("preserves $similarity field from Astra results", async () => {
    mockSearchSimilarPlaces.mockResolvedValue([
      {
        place_id: 1,
        name: "Place",
        description: "Desc",
        $similarity: 0.88,
      },
    ]);
    const results = await searchPlaces("place");
    expect(results[0].$similarity).toBe(0.88);
  });
});
