"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/db";
import { signIn, auth } from "@/auth";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["builder", "traveller"]).default("traveller"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export type RegisterResult =
  | { success: true }
  | { success: false; error: string };

export async function registerUser(
  input: RegisterInput,
): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { name, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "An account with this email already exists." };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { name, email, password: hashedPassword, role },
  });

  return { success: true };
}

export async function upgradeToBuilder(): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: "builder" },
  });

  return { success: true };
}

export async function loginUser(email: string, password: string) {
  try {
    await signIn("credentials", { email, password, redirect: false });
    return { success: true };
  } catch {
    return { success: false, error: "Invalid email or password." };
  }
}
