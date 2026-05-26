import { POST } from "@/app/api/route/osrm-table/route";

global.fetch = jest.fn();

describe("POST /api/route/osrm-table", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when fewer than 2 points", async () => {
    const request = new Request("http://localhost:3000/api/route/osrm-table", {
      method: "POST",
      body: JSON.stringify({ points: [{ lat: 27.7, lon: 85.3 }] }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("At least two points");
  });

  it("returns 400 when points exceed max", async () => {
    const points = Array.from({ length: 30 }, (_, i) => ({
      lat: 27 + i * 0.1,
      lon: 85 + i * 0.1,
    }));
    const request = new Request("http://localhost:3000/api/route/osrm-table", {
      method: "POST",
      body: JSON.stringify({ points }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    expect((await response.json()).error).toContain("Too many points");
  });

  it("returns 400 for invalid point data", async () => {
    const request = new Request("http://localhost:3000/api/route/osrm-table", {
      method: "POST",
      body: JSON.stringify({
        points: [{ lat: "invalid", lon: 85.3 }, { lat: 27.7, lon: 85.3 }],
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 502 when OSRM request fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });
    const request = new Request("http://localhost:3000/api/route/osrm-table", {
      method: "POST",
      body: JSON.stringify({
        points: [
          { lat: 27.7, lon: 85.3 },
          { lat: 28.2, lon: 83.9 },
        ],
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(502);
  });

  it("returns 502 when OSRM does not return Ok code", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ code: "Error", message: "Invalid request" }),
    });
    const request = new Request("http://localhost:3000/api/route/osrm-table", {
      method: "POST",
      body: JSON.stringify({
        points: [
          { lat: 27.7, lon: 85.3 },
          { lat: 28.2, lon: 83.9 },
        ],
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(502);
  });

  it("returns 200 with valid distance matrix", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        code: "Ok",
        distances: [
          [0, 1000],
          [1000, 0],
        ],
      }),
    });
    const request = new Request("http://localhost:3000/api/route/osrm-table", {
      method: "POST",
      body: JSON.stringify({
        points: [
          { lat: 27.7, lon: 85.3 },
          { lat: 28.2, lon: 83.9 },
        ],
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.distances).toBeDefined();
    expect(body.distances[0][1]).toBe(1000);
  });

  it("validates and fixes unreasonably long road distances", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        code: "Ok",
        distances: [
          [0, 9999999],
          [9999999, 0],
        ],
      }),
    });
    const request = new Request("http://localhost:3000/api/route/osrm-table", {
      method: "POST",
      body: JSON.stringify({
        points: [
          { lat: 0, lon: 0 },
          { lat: 0.01, lon: 0.01 },
        ],
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.problematicSegments).toBeDefined();
    expect(body.problematicSegments.length).toBeGreaterThan(0);
  });
});
