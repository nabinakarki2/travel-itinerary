"use client";

import { FormEvent, useState } from "react";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { addPlace, AddPlaceInput } from "@/actions/place";
import {
  AlertCircle,
  Camera,
  CheckCircle,
  Globe,
  MapPin,
  Plus,
  ShieldCheck,
} from "lucide-react";

type LocationPickerMapProps = {
  latitude: number;
  longitude: number;
  onPick: (latitude: number, longitude: number) => void;
};

const LocationPickerMap = dynamic<LocationPickerMapProps>(
  () => import("@/components/custom/LocationPickerMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-105 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
    ),
  },
) as ComponentType<LocationPickerMapProps>;

const placeTypes = [
  "Temple",
  "Pilgrimage",
  "Park",
  "Waterfall",
  "Lake",
  "Museum",
  "Viewpoint",
  "Heritage Site",
  "Hotel",
  "Restaurant",
  "Other",
];

const defaultForm: AddPlaceInput = {
  name: "",
  district: "",
  state: "Lumbini",
  type: "Temple",
  latitude: 0,
  longitude: 0,
  description: "",
  imageUrl: "",
};

export default function LocalGuidePage() {
  const [form, setForm] = useState<AddPlaceInput>(defaultForm);
  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message?: string;
  }>({ type: "idle" });

  function update<K extends keyof AddPlaceInput>(
    key: K,
    value: AddPlaceInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus({ type: "loading" });

    const result = await addPlace(form);

    if (result.success) {
      setStatus({
        type: "success",
        message: `Place added successfully! (ID: ${result.placeId})`,
      });
      setForm(defaultForm);
    } else {
      setStatus({ type: "error", message: result.error });
    }
  }

  const isSubmitting = status.type === "loading";

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

      <div className="mx-auto mt-8 grid max-w-6xl gap-6 px-4 md:mt-10 md:grid-cols-[1fr_2fr] md:px-8">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              Entry Guidelines
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Keep submissions accurate, concise, and traveler-focused for
              better search quality and recommendations.
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                Use official names and correct district information.
              </li>
              <li className="flex items-start gap-2">
                <Camera className="mt-0.5 h-4 w-4 text-primary" />
                Add a representative image URL whenever possible.
              </li>
            </ul>
          </div>
        </aside>

        <section>
          {/* Status banner */}
          {status.type === "success" && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
              {status.message}
            </div>
          )}
          {status.type === "error" && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
              {status.message}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-[0_18px_40px_-26px_rgba(15,66,114,0.55)] backdrop-blur md:p-8"
          >
            <div className="mb-1">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Add a New Place
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Complete the details below to publish your local recommendation.
              </p>
            </div>
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Place Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Tamghas Resunga Temple"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* District + State */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  District <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={form.district}
                  onChange={(e) => update("district", e.target.value)}
                  placeholder="e.g. Gulmi"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  State / Province <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  placeholder="e.g. Lumbini"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Place Type <span className="text-red-500">*</span>
              </label>
              <select
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
              >
                {placeTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Lat + Long */}
            <div>
              <LocationPickerMap
                latitude={form.latitude}
                longitude={form.longitude}
                onPick={(latitude: number, longitude: number) => {
                  update("latitude", Number(latitude.toFixed(6)));
                  update("longitude", Number(longitude.toFixed(6)));
                }}
              />

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={form.latitude || ""}
                    onChange={(e) =>
                      update("latitude", parseFloat(e.target.value) || 0)
                    }
                    placeholder="Auto-filled from map"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={form.longitude || ""}
                    onChange={(e) =>
                      update("longitude", parseFloat(e.target.value) || 0)
                    }
                    placeholder="Auto-filled from map"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Tip: switch between Normal and Satellite view, then click a spot
                on the map to fill coordinates automatically.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="A brief description of the place, its significance, and what visitors can expect..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Image URL
              </label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => update("imageUrl", e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Adding Place...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Place
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
