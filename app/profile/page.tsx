import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const places = await prisma.place.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  return (
    <ProfileClient
      places={places.map((p) => ({
        id: p.id,
        name: p.name,
        district: p.district,
        state: p.state,
        type: p.type,
        description: p.description,
        imageUrl: p.imageUrl,
        createdAt: p.createdAt.toISOString(),
      }))}
      user={{ name: user?.name ?? "", email: user?.email ?? "" }}
    />
  );
}
