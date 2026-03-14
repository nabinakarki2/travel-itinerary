import OpenAI from "openai";
import type {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";

const NOVA_BASE_URL = "https://api.nova.amazon.com/v1";
const NOVA_MODEL = "nova-2-lite-v1";

function getNovaClient() {
  const apiKey = process.env.NOVA_API_KEY;

  if (!apiKey) {
    throw new Error("NOVA_API_KEY is not set.");
  }

  return new OpenAI({
    baseURL: NOVA_BASE_URL,
    apiKey,
  });
}

export async function generateNovaChatReply(
  messages: ChatCompletionMessageParam[],
): Promise<string> {
  const client = getNovaClient();

  const completion = await client.chat.completions.create({
    model: NOVA_MODEL,
    messages,
  });

  return completion.choices[0]?.message?.content ?? "";
}

export async function generateNovaChatStream(
  messages: ChatCompletionMessageParam[],
): Promise<AsyncIterable<ChatCompletionChunk>> {
  const client = getNovaClient();

  const stream = await client.chat.completions.create({
    model: NOVA_MODEL,
    messages,
    stream: true,
    stream_options: { include_usage: true },
  });

  return stream;
}
