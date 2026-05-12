import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { Globe } from "lucide-react";
import LocalGuideForm from "./LocalGuideForm";

type Props = {
  searchParams: Promise<{ edit?: string }>;
};

export default async function LocalGuidePage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  let editPlace = null;

  if (params.edit) {
    const id = parseInt(params.edit, 10);
    if (!isNaN(id)) {
      const place = await prisma.place.findUnique({ where: { id } });
      if (place && place.userId === session.user.id) {
        editPlace = {
          id: place.id,
          name: place.name,
          district: place.district,
          state: place.state,
          type: place.type,
          latitude: place.latitude ?? 0,
          longitude: place.longitude ?? 0,
          description: place.description ?? "",
          imageUrl: place.imageUrl ?? "",
        };
      }
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top,rgba(15,66,114,0.12),rgba(255,255,255,0.98)_48%)] pb-14">
      <section className="relative isolate overflow-hidden border-b border-slate-200/70 min-h-[30rem]">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-bottom"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1701876921772-5ef5af26e2b0?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          }}
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-slate-950/80 via-slate-900/55 to-primary/35" />
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-20">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white/90 backdrop-blur">
              <Globe className="h-3.5 w-3.5" />
              Local Guide Console
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-white md:text-5xl">
              Publish trusted local places with a clean, structured workflow.
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-white/85 md:text-base">
              Help travelers discover authentic destinations across Nepal by
              adding high-quality, verified place data in minutes.
            </p>
          </div>
        </div>
      </section>

      <LocalGuideForm editPlace={editPlace} />
    </main>
  );
}
