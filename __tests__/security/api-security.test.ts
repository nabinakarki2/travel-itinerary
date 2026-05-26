import { POST } from "@/app/api/route/osrm-table/route";

global.fetch = jest.fn();

describe("API Security", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("OSRM API - Input Sanitization", () => {
    it("rejects request with non-array points", async () => {
      const request = new Request("http://localhost:3000/api/route/osrm-table", {
        method: "POST",
        body: JSON.stringify({ points: "not-an-array" }),
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("rejects request with empty points array", async () => {
      const request = new Request("http://localhost:3000/api/route/osrm-table", {
        method: "POST",
        body: JSON.stringify({ points: [] }),
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("rejects request with points containing missing coordinates", async () => {
      const request = new Request("http://localhost:3000/api/route/osrm-table", {
        method: "POST",
        body: JSON.stringify({
          points: [{ lat: 27.7 }, { lon: 85.3 }],
        }),
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("rejects request with points containing non-finite coordinates", async () => {
      const request = new Request("http://localhost:3000/api/route/osrm-table", {
        method: "POST",
        body: JSON.stringify({
          points: [
            { lat: Infinity, lon: 85.3 },
            { lat: 27.7, lon: 85.3 },
          ],
        }),
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  it("handles large payloads gracefully without crashing", async () => {
    const largePoints = Array.from({ length: 25 }, (_, i) => ({
      lat: 27 + i * 0.01,
      lon: 85 + i * 0.01,
    }));

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => {
        const size = largePoints.length;
        return {
          code: "Ok",
          distances: Array.from({ length: size }, () =>
            Array.from({ length: size }, () => 1000),
          ),
        };
      },
    });

    const request = new Request("http://localhost:3000/api/route/osrm-table", {
      method: "POST",
      body: JSON.stringify({ points: largePoints }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it("rejects duplicate point entries as valid (no crash)", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        code: "Ok",
        distances: [
          [0, 0],
          [0, 0],
        ],
      }),
    });

    const request = new Request("http://localhost:3000/api/route/osrm-table", {
      method: "POST",
      body: JSON.stringify({
        points: [
          { lat: 27.7, lon: 85.3 },
          { lat: 27.7, lon: 85.3 },
        ],
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});
