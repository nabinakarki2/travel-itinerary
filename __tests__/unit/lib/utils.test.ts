import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges class names correctly", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("resolves tailwind conflicts (last wins)", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });

  it("handles empty inputs", () => {
    expect(cn()).toBe("");
  });

  it("handles undefined and null", () => {
    expect(cn("px-4", undefined, null, "py-2")).toBe("px-4 py-2");
  });

  it("merges multiple class categories", () => {
    const result = cn("flex", "items-center", "justify-between", "px-4");
    expect(result).toContain("flex");
    expect(result).toContain("items-center");
    expect(result).toContain("justify-between");
    expect(result).toContain("px-4");
  });

  it("resolves padding conflict correctly", () => {
    expect(cn("p-4", "p-6")).toBe("p-6");
  });

  it("resolves margin conflict correctly", () => {
    expect(cn("m-2", "m-4")).toBe("m-4");
  });
});
