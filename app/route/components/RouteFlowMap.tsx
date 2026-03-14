"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";

export type RouteFlowMapPoint = {
  id: string;
  label: string;
  lat: number;
  lon: number;
};

type RouteFlowMapProps = {
  points: RouteFlowMapPoint[];
};

type LatLngTuple = [number, number];

type PathSegment = {
  key: string;
  coordinates: LatLngTuple[];
  fromLabel: string;
  toLabel: string;
  isFallback: boolean;
};

const PLACE_COLORS = [
  "#0ea5e9",
  "#4f46e5",
  "#8b5cf6",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
];

function getPlaceColor(index: number, totalPoints: number) {
  if (index === 0) {
    return "#059669";
  }

  if (index === totalPoints - 1) {
    return "#ea580c";
  }

  return PLACE_COLORS[(index - 1) % PLACE_COLORS.length];
}

/**
 * Calculate straight-line distance between two coordinates in km
 */
function calculateStraightLineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function FitRouteBounds({ coordinates }: { coordinates: LatLngTuple[] }) {
  const map = useMap();

  useEffect(() => {
    if (coordinates.length === 0) return;

    if (coordinates.length === 1) {
      map.setView(coordinates[0], 12, { animate: true });
      return;
    }

    map.fitBounds(coordinates, {
      padding: [24, 24],
      animate: true,
    });
  }, [coordinates, map]);

  return null;
}

function segmentKey(from: RouteFlowMapPoint, to: RouteFlowMapPoint) {
  return `${from.lat.toFixed(6)},${from.lon.toFixed(6)}->${to.lat.toFixed(6)},${to.lon.toFixed(6)}`;
}

export default function RouteFlowMap({ points }: RouteFlowMapProps) {
  const [pathSegments, setPathSegments] = useState<PathSegment[]>([]);
  const [isPathLoading, setIsPathLoading] = useState(false);
  const [pathError, setPathError] = useState("");
  const [failedSegments, setFailedSegments] = useState<
    Array<{ from: string; to: string }>
  >([]);
  const segmentCacheRef = useRef<Map<string, LatLngTuple[]>>(new Map());

  const markerCoordinates = useMemo<LatLngTuple[]>(
    () => points.map((point) => [point.lat, point.lon]),
    [points],
  );

  useEffect(() => {
    if (points.length < 2) {
      setPathSegments([]);
      setPathError("");
      return;
    }

    let cancelled = false;

    const fetchRoutePath = async () => {
      setIsPathLoading(true);
      setPathError("");
      setFailedSegments([]);

      const nextSegments: PathSegment[] = [];
      const failedSegs: Array<{ from: string; to: string }> = [];

      for (let index = 0; index < points.length - 1; index += 1) {
        const from = points[index];
        const to = points[index + 1];
        const key = segmentKey(from, to);

        let segment = segmentCacheRef.current.get(key);

        if (!segment) {
          const straightLineDistance = calculateStraightLineDistance(
            from.lat,
            from.lon,
            to.lat,
            to.lon,
          );

          try {
            const response = await fetch(
              `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson`,
            );

            const data = (await response.json()) as {
              routes?: Array<{
                distance?: number;
                geometry?: { coordinates?: number[][] };
              }>;
            };

            const rawCoordinates = data.routes?.[0]?.geometry?.coordinates;
            const distance = data.routes?.[0]?.distance;

            // Check if road distance is unreasonably long (> 2.5x straight line)
            const roadDistance = distance ? distance / 1000 : null;
            const isDistanceUnreasonable =
              roadDistance && roadDistance > straightLineDistance * 2.5;

            if (
              response.ok &&
              Array.isArray(rawCoordinates) &&
              rawCoordinates.length > 0 &&
              !isDistanceUnreasonable
            ) {
              segment = rawCoordinates
                .filter((pair) => Array.isArray(pair) && pair.length >= 2)
                .map((pair) => [pair[1], pair[0]] as LatLngTuple);
            } else {
              segment = [
                [from.lat, from.lon],
                [to.lat, to.lon],
              ];
              failedSegs.push({
                from: from.label,
                to: to.label,
              });
            }
          } catch {
            segment = [
              [from.lat, from.lon],
              [to.lat, to.lon],
            ];
            failedSegs.push({
              from: from.label,
              to: to.label,
            });
          }

          segmentCacheRef.current.set(key, segment);
        }

        nextSegments.push({
          key,
          coordinates: segment,
          fromLabel: from.label,
          toLabel: to.label,
          isFallback: failedSegs.some(
            (failed) => failed.from === from.label && failed.to === to.label,
          ),
        });
      }

      if (!cancelled) {
        setPathSegments(nextSegments);
        setFailedSegments(failedSegs);
        setPathError(
          failedSegs.length > 0
            ? "Some road segments are missing or unreasonably long in the road network data. Dashed lines indicate direct fallback paths."
            : "",
        );
        setIsPathLoading(false);
      }
    };

    void fetchRoutePath();

    return () => {
      cancelled = true;
    };
  }, [points]);

  if (points.length < 2) {
    return null;
  }

  const initialCenter: LatLngTuple = [points[0].lat, points[0].lon];
  const displayPath = useMemo<LatLngTuple[]>(() => {
    if (pathSegments.length === 0) {
      return markerCoordinates;
    }

    return pathSegments.flatMap((segment, index) =>
      index === 0 ? segment.coordinates : segment.coordinates.slice(1),
    );
  }, [markerCoordinates, pathSegments]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-linear-to-br from-white via-sky-50/40 to-cyan-50/40 p-4 shadow-sm md:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Route Flow Map
          </h3>
          <p className="text-xs text-slate-600">
            Ordered travel path with color-coded places and segments.
          </p>
        </div>
        {isPathLoading ? (
          <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700">
            Loading route...
          </span>
        ) : null}
      </div>

      {pathError ? (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-semibold text-amber-900">{pathError}</p>
          {failedSegments.length > 0 && (
            <ul className="mt-2 space-y-1">
              {failedSegments.map((segment, idx) => (
                <li key={idx} className="text-xs text-amber-800">
                  • {segment.from} → {segment.to}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-[0_12px_24px_-18px_rgba(15,23,42,0.55)]">
        <MapContainer
          center={initialCenter}
          zoom={8}
          scrollWheelZoom
          className="h-96 w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          <FitRouteBounds coordinates={displayPath} />

          {pathSegments.length > 0
            ? pathSegments.map((segment, index) => {
                const segmentColor = getPlaceColor(index + 1, points.length);

                return (
                  <Polyline
                    key={segment.key}
                    positions={segment.coordinates}
                    pathOptions={{
                      color: segmentColor,
                      weight: segment.isFallback ? 4 : 5,
                      opacity: segment.isFallback ? 0.7 : 0.9,
                      dashArray: segment.isFallback ? "8 8" : undefined,
                      lineCap: "round",
                      lineJoin: "round",
                    }}
                  >
                    <Tooltip sticky>
                      <div className="text-xs">
                        <div className="font-semibold">
                          {segment.fromLabel} → {segment.toLabel}
                        </div>
                        <div className="text-slate-600">
                          {segment.isFallback
                            ? "Direct fallback segment"
                            : "Road network segment"}
                        </div>
                      </div>
                    </Tooltip>
                  </Polyline>
                );
              })
            : null}

          {points.map((point, index) => {
            const isStart = index === 0;
            const isEnd = index === points.length - 1;
            const markerColor = getPlaceColor(index, points.length);

            return (
              <CircleMarker
                key={point.id}
                center={[point.lat, point.lon]}
                radius={isStart || isEnd ? 9 : 7}
                pathOptions={{
                  color: "#ffffff",
                  fillColor: markerColor,
                  fillOpacity: 0.95,
                  weight: 2.5,
                }}
              >
                <Tooltip direction="top" offset={[0, -2]}>
                  <div className="text-xs">
                    <div className="font-semibold">
                      {index + 1}. {point.label}
                    </div>
                    <div className="text-slate-600">
                      {isStart ? "Start" : isEnd ? "Destination" : "Stop"}
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {points.map((point, index) => {
          const isStart = index === 0;
          const isEnd = index === points.length - 1;
          const placeColor = getPlaceColor(index, points.length);

          return (
            <div
              key={`${point.id}-legend`}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white/90 px-3 py-2"
            >
              <span
                className="inline-block h-3.5 w-3.5 rounded-full ring-2 ring-white"
                style={{ backgroundColor: placeColor }}
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-900">
                  {index + 1}. {point.label}
                </p>
                <p className="text-[11px] text-slate-600">
                  {isStart ? "Start" : isEnd ? "Destination" : "Stop"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
