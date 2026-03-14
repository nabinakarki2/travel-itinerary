import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/gemini";
import { searchSimilarPlaces } from "@/lib/astra";
import { generateNovaChatStream } from "@/lib/nova";

type IncomingChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type PlaceResult = {
  place_id: number;
  name: string;
  description: string;
  district?: string;
  state?: string;
  type?: string;
  latitude?: number;
  longitude?: number;
  $similarity?: number;
};

const PLACE_KEYWORDS = [
  "place",
  "visit",
  "go",
  "travel",
  "trip",
  "tour",
  "explore",
  "hotel",
  "stay",
  "restaurant",
  "food",
  "eat",
  "temple",
  "park",
  "mountain",
  "lake",
  "river",
  "forest",
  "district",
  "city",
  "village",
  "town",
  "state",
  "nepal",
  "butwal",
  "pokhara",
  "kathmandu",
  "chitwan",
  "lumbini",
  "recommend",
  "suggest",
  "near",
  "around",
  "best",
  "itinerary",
  "route",
  "destination",
];

function isPlaceRelatedQuery(message: string): boolean {
  const lower = message.toLowerCase();
  return PLACE_KEYWORDS.some((kw) => lower.includes(kw));
}

function buildRAGPrompt(query: string, places: PlaceResult[]): string {
  const contextLines = places
    .map(
      (p, i) =>
        `${i + 1}. **${p.name}** (${p.type ?? "Place"})
   - District: ${p.district ?? "N/A"}, State: ${p.state ?? "N/A"}
   - Coordinates: ${p.latitude ?? "N/A"}, ${p.longitude ?? "N/A"}
   - Description: ${p.description ?? "No description"}`,
    )
    .join("\n\n");

  return `You are a helpful Nepal domestic travel assistant. Use the following relevant places from our database to answer the user's query. Be friendly, informative, and suggest specific details from the context.

## Relevant Places from Database:
${contextLines}

## User Query:
${query}

Respond naturally using the context above. If the user asks for recommendations or an itinerary, reference the places by name and give practical travel advice.

**IMPORTANT: Format your entire response using markdown. Use headings (##), bullet points (-), bold text (**text**), and links where appropriate.**`;
}

function buildGeneralPrompt(query: string): string {
  return `You are a helpful Nepal domestic travel assistant. Answer the user's question in a friendly and concise way. If relevant, gently guide them to explore places in Nepal.

User: ${query}

**IMPORTANT: Format your entire response using markdown. Use headings (##), bullet points (-), bold text (**text**), and code blocks (\`\`\`) where appropriate.**`;
}

async function searchPlaces(query: string, limit = 5): Promise<PlaceResult[]> {
  const vector = await generateEmbedding(query);
  const raw = await searchSimilarPlaces(vector, limit);

  return raw.map((doc: any) => ({
    place_id: doc.place_id,
    name: doc.name,
    description: doc.description,
    district: doc.district,
    state: doc.state,
    type: doc.type,
    latitude: doc.latitude,
    longitude: doc.longitude,
    $similarity: doc.$similarity,
  }));
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      message?: string;
      history?: IncomingChatMessage[];
    };

    const message = body.message?.trim();
    const history = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 },
      );
    }

    const usedRAG = isPlaceRelatedQuery(message);
    let sources: PlaceResult[] = [];
    let prompt = buildGeneralPrompt(message);

    if (usedRAG) {
      try {
        sources = await searchPlaces(message, 5);
      } catch (err) {
        console.warn(
          "[RAG] Vector search failed, falling back to general:",
          err,
        );
      }

      if (sources.length > 0) {
        prompt = buildRAGPrompt(message, sources);
      }
    }

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          "You are a helpful Nepal domestic travel assistant. Always respond in markdown with clear headings and concise bullet points when useful.",
      },
      ...history.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      })),
      {
        role: "user",
        content: prompt,
      },
    ];

    const completionStream = await generateNovaChatStream(messages);
    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const push = (payload: unknown) => {
          controller.enqueue(encoder.encode(`${JSON.stringify(payload)}\n`));
        };

        try {
          let metaSent = false;

          for await (const chunk of completionStream) {
            const text = chunk.choices?.[0]?.delta?.content;
            if (text) {
              // Send chat chunk first
              push({ type: "chunk", text });

              // Send meta (cards) after first chunk arrives
              if (!metaSent) {
                push({
                  type: "meta",
                  sources,
                  usedRAG: usedRAG && sources.length > 0,
                });
                metaSent = true;
              }
            }
          }
          push({ type: "done" });
        } catch (error: unknown) {
          push({
            type: "error",
            message:
              error instanceof Error ? error.message : "Streaming failed.",
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected server error.",
      },
      { status: 500 },
    );
  }
}
