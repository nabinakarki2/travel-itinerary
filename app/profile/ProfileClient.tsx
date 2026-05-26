"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deletePlace } from "@/actions/place";
import { upgradeToBuilder } from "@/actions/auth";
import {
  MapPin,
  Pencil,
  Trash2,
  Plus,
  AlertCircle,
  LogOut,
  User,
  HardHat,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { signOut } from "next-auth/react";

type PlaceItem = {
  id: number;
  name: string;
  district: string;
  state: string;
  type: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
};

type Props = {
  places: PlaceItem[];
  user: { name: string; email: string; role: string };
};

export default function ProfileClient({ places, user }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  const isBuilder = user.role === "builder";

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this place?")) return;
    setDeletingId(id);
    setError("");

    const result = await deletePlace(id);
    if (result.success) {
      router.refresh();
    } else {
      setError(result.error);
    }
    setDeletingId(null);
  }

  async function handleUpgrade() {
    if (!confirm("Change your account to Builder? You'll be able to add new places to the platform.")) return;
    setUpgrading(true);
    setError("");

    const result = await upgradeToBuilder();
    if (result.success) {
      setUpgradeSuccess(true);
      setUpgrading(false);
      router.refresh();
    } else {
      setError(result.error ?? "Something went wrong.");
      setUpgrading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top,rgba(15,66,114,0.1),rgba(255,255,255,0.98)_48%)] pb-14">
      <section className="relative isolate overflow-hidden border-b border-slate-200/70 min-h-[18rem]">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1470&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-slate-950/80 to-primary/35" />
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-white">
              <User className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-white md:text-3xl">
                  {user.name}
                </h1>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  isBuilder
                    ? "bg-amber-400/20 text-amber-300"
                    : "bg-white/20 text-white/80"
                }`}>
                  {isBuilder ? (
                    <><HardHat className="h-3 w-3" /> Builder</>
                  ) : (
                    <><User className="h-3 w-3" /> Traveller</>
                  )}
                </span>
              </div>
              <p className="text-sm text-white/80">{user.email}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-8 max-w-6xl px-4 md:px-8">
        {upgradeSuccess && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            Account upgraded to Builder! You can now add places.
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Your Places
            </h2>
            <p className="text-sm text-slate-600">
              {places.length} {places.length === 1 ? "place" : "places"} added
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
            {isBuilder && (
              <Link
                href="/local-guide"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-medium text-white transition hover:bg-primary/90"
              >
                <Plus className="h-3.5 w-3.5" />
                Add new
              </Link>
            )}
          </div>
        </div>

        {!isBuilder && !upgradeSuccess && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <HardHat className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Upgrade to Builder</h3>
                  <p className="mt-0.5 text-xs text-slate-600">
                    Get access to add and manage places on the platform.
                  </p>
                </div>
              </div>
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-medium text-white transition hover:bg-primary/90 disabled:opacity-60"
              >
                {upgrading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Upgrade now"
                )}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {places.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-12 text-center">
            <MapPin className="mx-auto h-8 w-8 text-slate-400" />
            <h3 className="mt-3 text-lg font-medium text-slate-700">
              No places yet
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {isBuilder
                ? "Start adding local places to share with travelers."
                : "Upgrade to a Builder account to start adding places."}
            </p>
            {isBuilder && (
              <Link
                href="/local-guide"
                className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-5 text-sm font-medium text-white hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Add your first place
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((place) => (
              <div
                key={place.id}
                className="group rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between">
                  <span className="rounded-lg bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {place.type}
                  </span>
                  {isBuilder && (
                    <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                      <Link
                        href={`/local-guide?edit=${place.id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(place.id)}
                        disabled={deletingId === place.id}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-slate-900">{place.name}</h3>
                <p className="mt-0.5 text-sm text-slate-600">
                  {place.district}, {place.state}
                </p>
                {place.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {place.description}
                  </p>
                )}
                <p className="mt-3 text-xs text-slate-400">
                  Added {new Date(place.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
