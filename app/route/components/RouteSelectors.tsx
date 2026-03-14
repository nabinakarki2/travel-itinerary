"use client";

import RouteOptionSelect from "@/app/route/components/RouteOptionSelect";
import type { Coordinates, RouteOption } from "@/app/route/components/types";

type RouteSelectorsProps = {
  placesLength: number;
  startId: number | null;
  endId: number | null;
  startOptions: RouteOption[];
  endOptions: RouteOption[];
  startOption?: RouteOption;
  endOption?: RouteOption;
  startCoords: Coordinates | null;
  endCoords: Coordinates | null;
  onStartChange: (value: number | null) => void;
  onEndChange: (value: number | null) => void;
};

export default function RouteSelectors({
  placesLength,
  startId,
  endId,
  startOptions,
  endOptions,
  startOption,
  endOption,
  startCoords,
  endCoords,
  onStartChange,
  onEndChange,
}: RouteSelectorsProps) {
  if (placesLength === 0) return null;

  return (
    <>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">Start</h2>
          <p className="text-xs text-slate-500">
            Choose where the itinerary begins.
          </p>
          <div className="mt-3">
            <RouteOptionSelect
              label="From"
              placeholder="Select start"
              value={startId}
              options={startOptions}
              onChange={onStartChange}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">Destination</h2>
          <p className="text-xs text-slate-500">
            Choose your final stop on the route.
          </p>
          <div className="mt-3">
            <RouteOptionSelect
              label="To"
              placeholder="Select destination"
              value={endId}
              options={endOptions}
              onChange={onEndChange}
            />
          </div>
        </div>
      </div>

      {startOption && endOption ? (
        <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-primary">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <strong>Route:</strong> {startOption.label} → {endOption.label}
            </div>
            <div className="text-xs text-primary/80">
              {startCoords ? (
                <span>
                  Start: {startCoords.lat.toFixed(6)},{" "}
                  {startCoords.lon.toFixed(6)}
                </span>
              ) : (
                <span>Start coordinates unavailable</span>
              )}
              <span className="mx-2">•</span>
              {endCoords ? (
                <span>
                  End: {endCoords.lat.toFixed(6)}, {endCoords.lon.toFixed(6)}
                </span>
              ) : (
                <span>End coordinates unavailable</span>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
