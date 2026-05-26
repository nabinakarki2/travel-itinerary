import { registerUser } from "@/actions/auth";

jest.mock("@/auth", () => ({
  signIn: jest.fn(),
  auth: jest.fn(),
  handlers: {},
}));

jest.mock("@/lib/db", () => {
  const mockFindUnique = jest.fn();
  const mockCreate = jest.fn();
  return {
    __esModule: true,
    default: {
      user: {
        findUnique: mockFindUnique,
        create: mockCreate,
      },
    },
  };
});

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
}));

const mockDb = jest.requireMock("@/lib/db").default;

describe("registerUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registers a new user successfully", async () => {
    mockDb.user.findUnique.mockResolvedValue(null);
    mockDb.user.create.mockResolvedValue({ id: "1", name: "Test User" });

    const result = await registerUser({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
    expect(mockDb.user.create).toHaveBeenCalledWith({
      data: {
        name: "Test User",
        email: "test@example.com",
        password: "hashed_password",
      },
    });
  });

  it("rejects registration with short name", async () => {
    const result = await registerUser({
      name: "A",
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Name");
    }
  });

  it("rejects registration with invalid email", async () => {
    const result = await registerUser({
      name: "Test User",
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects registration with short password", async () => {
    const result = await registerUser({
      name: "Test User",
      email: "test@example.com",
      password: "123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects duplicate email", async () => {
    mockDb.user.findUnique.mockResolvedValue({ id: "1", email: "test@example.com" });

    const result = await registerUser({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("already exists");
    }
  });

  it("hashes password with 12 rounds", async () => {
    const bcrypt = require("bcryptjs");
    mockDb.user.findUnique.mockResolvedValue(null);
    mockDb.user.create.mockResolvedValue({ id: "1" });

    await registerUser({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 12);
  });
});
