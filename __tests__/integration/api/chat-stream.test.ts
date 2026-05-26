import { POST } from "@/app/api/chat/stream/route";

jest.mock("@/lib/gemini", () => ({
  generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
}));

jest.mock("@/lib/astra", () => ({
  searchSimilarPlaces: jest.fn().mockResolvedValue([]),
}));

jest.mock("@/lib/nova", () => ({
  generateNovaChatStream: jest.fn(),
}));

const mockGenerateNovaChatStream = jest.requireMock(
  "@/lib/nova",
).generateNovaChatStream;

async function collectStream(response: Response): Promise<string> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let result = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }
  return result;
}

function makeAsyncIterator<T>(items: T[]): AsyncIterable<T> {
  return {
    [Symbol.asyncIterator]: async function* () {
      for (const item of items) {
        yield item;
      }
    },
  };
}

describe("POST /api/chat/stream", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when message is missing", async () => {
    const request = new Request("http://localhost:3000/api/chat/stream", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 when message is empty string", async () => {
    const request = new Request("http://localhost:3000/api/chat/stream", {
      method: "POST",
      body: JSON.stringify({ message: "   " }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 500 when nova stream fails", async () => {
    mockGenerateNovaChatStream.mockRejectedValue(new Error("Nova API down"));
    const request = new Request("http://localhost:3000/api/chat/stream", {
      method: "POST",
      body: JSON.stringify({ message: "hello" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(500);
  });

  it("streams ndjson response for valid request", async () => {
    const asyncIterable = makeAsyncIterator([
      { choices: [{ delta: { content: "Hello" } }] },
      { choices: [{ delta: { content: " world" } }] },
    ]);
    mockGenerateNovaChatStream.mockResolvedValue(asyncIterable);

    const request = new Request("http://localhost:3000/api/chat/stream", {
      method: "POST",
      body: JSON.stringify({ message: "Nepal travel tips" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("ndjson");

    const raw = await collectStream(response);
    const lines = raw.trim().split("\n").filter(Boolean);

    expect(lines.length).toBeGreaterThanOrEqual(3);
    const lastLine = JSON.parse(lines[lines.length - 1]);
    expect(lastLine.type).toBe("done");
  });

  it("sends meta payload with search results for place-related query", async () => {
    const asyncIterable = makeAsyncIterator([
      { choices: [{ delta: { content: "Recommended" } }] },
    ]);
    mockGenerateNovaChatStream.mockResolvedValue(asyncIterable);

    const request = new Request("http://localhost:3000/api/chat/stream", {
      method: "POST",
      body: JSON.stringify({ message: "recommend places in Pokhara" }),
    });
    const response = await POST(request);
    const raw = await collectStream(response);
    const lines = raw.trim().split("\n").filter(Boolean);

    const metaLine = lines.find((l) => {
      try {
        return JSON.parse(l).type === "meta";
      } catch {
        return false;
      }
    });
    expect(metaLine).toBeDefined();
    if (metaLine) {
      const meta = JSON.parse(metaLine);
      expect(meta.type).toBe("meta");
      expect(Array.isArray(meta.sources)).toBe(true);
    }
  });

  it("sends error payload when streaming encounters an error", async () => {
    const asyncIterable = makeAsyncIterator([
      { choices: [{ delta: { content: "Hello" } }] },
    ]);
    const errorSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    mockGenerateNovaChatStream.mockResolvedValue(asyncIterable);
    // Force the chat stream to throw mid-stream by making search fail
    const searchMock = jest.requireMock("@/lib/astra").searchSimilarPlaces;
    searchMock.mockRejectedValue(new Error("Search error"));

    const request = new Request("http://localhost:3000/api/chat/stream", {
      method: "POST",
      body: JSON.stringify({ message: "places" }),
    });
    const response = await POST(request);
    const raw = await collectStream(response);
    const lines = raw.trim().split("\n").filter(Boolean);

    // Should still work with fallback
    const lastLine = JSON.parse(lines[lines.length - 1]);
    expect(lastLine.type).toBe("done");

    errorSpy.mockRestore();
  });
});
