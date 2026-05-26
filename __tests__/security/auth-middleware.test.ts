jest.mock("next/server", () => ({
  NextResponse: {
    redirect: jest.fn().mockReturnValue({ status: 307 }),
    next: jest.fn().mockReturnValue({ status: undefined }),
  },
}));

import { config } from "@/middleware";

describe("Auth Middleware Security", () => {
  it("protects /local-guide route", () => {
    expect(config.matcher).toContain("/local-guide");
  });

  it("protects /profile route", () => {
    expect(config.matcher).toContain("/profile");
  });

  it("does not protect public routes", () => {
    expect(config.matcher).not.toContain("/");
    expect(config.matcher).not.toContain("/planner");
    expect(config.matcher).not.toContain("/route");
    expect(config.matcher).not.toContain("/login");
    expect(config.matcher).not.toContain("/register");
  });

  it("exactly matches expected protected routes", () => {
    expect(config.matcher).toEqual(["/local-guide", "/profile"]);
  });
});
