"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelectedPlaces } from "@/app/context/SelectedPlacesContext";
import { getPlacesByIds, PlaceDetail } from "@/actions/getPlacesByIds";
import RouteSelectors from "@/app/route/components/RouteSelectors";
import RouteGraph from "@/app/route/components/RouteGraph";
import PlacesTable from "@/app/route/components/PlacesTable";
import type { RouteOption } from "@/app/route/components/types";

export default function RoutePage() {
  const { selectedPlaces } = useSelectedPlaces();
  const selectedIds = useMemo(
    () => selectedPlaces.map((p) => p.place_id),
    [selectedPlaces],
  );

  const [placeDetails, setPlaceDetails] = useState<PlaceDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedIds.length === 0) {
      setPlaceDetails([]);
      return;
    }

    setLoading(true);
    setError("");

    (async () => {
      try {
        const details = await getPlacesByIds(selectedIds);
        setPlaceDetails(details);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to load place details.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedIds]);

  const places = placeDetails;
  const [startId, setStartId] = useState<number | null>(null);
  const [endId, setEndId] = useState<number | null>(null);

  const AIRPORT_OPTION = useMemo<RouteOption>(
    () => ({
      label: "Tribhuvan International Airport",
      value: -1,
      tag: "Recommended for international tourists",
      icon: "airport" as const,
      coords: { lat: 27.693912, lon: 85.35822 },
    }),
    [],
  );

  const CURRENT_LOCATION_OPTION = useMemo<RouteOption>(
    () => ({
      label: "Current Location",
      value: -2,
      icon: "location" as const,
    }),
    [],
  );

  const placeOptions = useMemo(
    () =>
      places.map((place) => ({
        label: place.name,
        value: place.id,
        imageUrl: place.imageUrl ?? undefined,
        tag: place.type ?? undefined,
        coords:
          place.latitude != null && place.longitude != null
            ? { lat: place.latitude, lon: place.longitude }
            : undefined,
      })),
    [places],
  );

  const startOptions = useMemo<RouteOption[]>(
    () => [AIRPORT_OPTION, CURRENT_LOCATION_OPTION, ...placeOptions],
    [AIRPORT_OPTION, CURRENT_LOCATION_OPTION, placeOptions],
  );

  const endOptions = useMemo<RouteOption[]>(
    () => [AIRPORT_OPTION, ...placeOptions],
    [AIRPORT_OPTION, placeOptions],
  );

  const startOption = startOptions.find((o) => o.value === startId);
  const endOption = endOptions.find((o) => o.value === endId);

  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  const [geoRequested, setGeoRequested] = useState(false);

  const startCoords =
    startOption?.value === -2 ? currentLocation : (startOption?.coords ?? null);
  const endCoords =
    endOption?.value === -2 ? currentLocation : (endOption?.coords ?? null);

  useEffect(() => {
    if (geoRequested) return;
    if (currentLocation) return;
    if (startId !== -2 && endId !== -2) return;
    if (!navigator.geolocation) return;

    setGeoRequested(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => {
        // Keep fallback behavior when user blocks location permission.
      },
    );
  }, [currentLocation, endId, geoRequested, startId]);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Route Planning
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Review the selected locations, choose a start and end point, and
            plan your itinerary. Selections persist across the planner
            interface.
          </p>

          <RouteSelectors
            placesLength={places.length}
            startId={startId}
            endId={endId}
            startOptions={startOptions}
            endOptions={endOptions}
            startOption={startOption}
            endOption={endOption}
            startCoords={startCoords}
            endCoords={endCoords}
            onStartChange={(value) => {
              if (value !== null && value === endId) {
                setEndId(null);
              }
              setStartId(value);
            }}
            onEndChange={(value) => {
              if (value !== null && value === startId) {
                setStartId(null);
              }
              setEndId(value);
            }}
          />
        </div>

        {selectedPlaces.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            No places selected. Please select places in the planner and click
            "Generate Route Plan".
          </div>
        ) : loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            Loading selected places...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        ) : places.length === 0 ? (
          <div className="rounded-2xl border border-warning-200 bg-warning-50 p-6 text-sm text-warning-800">
            No place details were found for the selected IDs.
          </div>
        ) : (
          <>
            <RouteGraph
              places={places}
              startId={startId}
              endId={endId}
              currentLocation={currentLocation}
              airportOption={AIRPORT_OPTION}
              currentLocationOption={CURRENT_LOCATION_OPTION}
            />
            <PlacesTable places={places} />
          </>
        )}
      </div>
    </main>
  );
}
