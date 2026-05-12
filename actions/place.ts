"use server";

import prisma from "@/lib/db";
import { auth } from "@/auth";
import { placeSchema, type AddPlaceInput } from "@/lib/schemas";
import { insertPlaceVector } from "@/lib/astra";
import { generateEmbedding } from "@/lib/gemini";

export type PlaceActionResult =
  | { success: true; placeId?: number }
  | { success: false; error: string };

export async function addPlace(input: AddPlaceInput): Promise<PlaceActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "You must be signed in." };
  }

  const parsed = placeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const data = parsed.data;
    const place = await prisma.place.create({
      data: {
        name: data.name,
        district: data.district,
        state: data.state,
        type: data.type,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        userId: session.user.id,
      },
    });

    const embeddingText = [
      data.name,
      data.type,
      data.district,
      data.state,
      data.description,
    ]
      .filter(Boolean)
      .join(" – ");

    const vector = await generateEmbedding(embeddingText);
    await insertPlaceVector(place.id, place.name, embeddingText, vector, {
      district: place.district,
      state: place.state,
      type: place.type,
      latitude: place.latitude,
      longitude: place.longitude,
      imageUrl: place.imageUrl,
    });

    return { success: true, placeId: place.id };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("addPlace error:", error);
    return { success: false, error: message };
  }
}

export async function updatePlace(
  id: number,
  input: AddPlaceInput,
): Promise<PlaceActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "You must be signed in." };
  }

  const existing = await prisma.place.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return { success: false, error: "Place not found or access denied." };
  }

  const parsed = placeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const data = parsed.data;
    await prisma.place.update({
      where: { id },
      data: {
        name: data.name,
        district: data.district,
        state: data.state,
        type: data.type,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
      },
    });

    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("updatePlace error:", error);
    return { success: false, error: message };
  }
}

export async function deletePlace(
  id: number,
): Promise<PlaceActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "You must be signed in." };
  }

  const existing = await prisma.place.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return { success: false, error: "Place not found or access denied." };
  }

  try {
    await prisma.place.delete({ where: { id } });
    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("deletePlace error:", error);
    return { success: false, error: message };
  }
}
