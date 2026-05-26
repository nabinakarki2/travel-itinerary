import { addPlace, updatePlace, deletePlace } from "@/actions/place";

jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  __esModule: true,
  default: {
    place: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock("@/lib/gemini", () => ({
  generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
}));

jest.mock("@/lib/astra", () => ({
  insertPlaceVector: jest.fn().mockResolvedValue(undefined),
}));

const mockAuth = jest.requireMock("@/auth").auth;
const mockDb = jest.requireMock("@/lib/db").default;

const validInput = {
  name: "Phewa Lake",
  district: "Kaski",
  state: "Gandaki",
  type: "Lake",
  latitude: 28.2096,
  longitude: 83.9456,
  description: "Beautiful lake in Pokhara",
};

describe("addPlace", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns error when user is not authenticated", async () => {
    mockAuth.mockResolvedValue({ user: null });
    const result = await addPlace(validInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("signed in");
    }
  });

  it("creates a place when authenticated", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockDb.place.create.mockResolvedValue({
      id: 1,
      name: "Phewa Lake",
      district: "Kaski",
      state: "Gandaki",
      type: "Lake",
      latitude: 28.2096,
      longitude: 83.9456,
      description: "Beautiful lake in Pokhara",
    });

    const result = await addPlace(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.placeId).toBe(1);
    }
    expect(mockDb.place.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Phewa Lake",
          userId: "user-1",
        }),
      }),
    );
  });

  it("rejects invalid input", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const result = await addPlace({
      name: "",
      district: "Kaski",
      state: "Gandaki",
      type: "Lake",
      latitude: 0,
      longitude: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("updatePlace", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue({ user: null });
    const result = await updatePlace(1, validInput);
    expect(result.success).toBe(false);
    expect(result).toEqual({ success: false, error: "You must be signed in." });
  });

  it("returns error when place not found or not owned by user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockDb.place.findUnique.mockResolvedValue(null);
    const result = await updatePlace(999, validInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("access denied");
    }
  });

  it("updates place when owned by user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockDb.place.findUnique.mockResolvedValue({
      id: 1,
      userId: "user-1",
    });
    mockDb.place.update.mockResolvedValue({ id: 1 });

    const result = await updatePlace(1, validInput);
    expect(result.success).toBe(true);
    expect(mockDb.place.update).toHaveBeenCalled();
  });
});

describe("deletePlace", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue({ user: null });
    const result = await deletePlace(1);
    expect(result.success).toBe(false);
  });

  it("returns error when place not found", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockDb.place.findUnique.mockResolvedValue(null);
    const result = await deletePlace(999);
    expect(result.success).toBe(false);
    expect(result).toEqual({
      success: false,
      error: "Place not found or access denied.",
    });
  });

  it("deletes place when owned by user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockDb.place.findUnique.mockResolvedValue({
      id: 1,
      userId: "user-1",
    });
    mockDb.place.delete.mockResolvedValue({ id: 1 });

    const result = await deletePlace(1);
    expect(result.success).toBe(true);
    expect(mockDb.place.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
