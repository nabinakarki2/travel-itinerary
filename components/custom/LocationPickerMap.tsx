"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { Layers, Search, X, Loader2 } from "lucide-react";

type PlaceResult = {
  place_id: number;
  name: string;
  lat: string;
  lon: string;
  display_name: string;
};

type MapMode = "normal" | "satellite";

type LocationPickerMapProps = {
  latitude: number;
  longitude: number;
  onPick: (latitude: number, longitude: number) => void;
};

const NEPAL_CENTER: [number, number] = [28.3949, 84.124];

function MapClickHandler({
  onPick,
}: {
  onPick: (latitude: number, longitude: number) => void;
}) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
}

function PlaceSearchBox({
  onSelectPlace,
}: {
  onSelectPlace: (lat: number, lon: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          `${searchQuery}, Nepal`,
        )}&limit=8`,
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowResults(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const handleSelectResult = (result: PlaceResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    onSelectPlace(lat, lon);
    setQuery("");
    setShowResults(false);
    setResults([]);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search place name (e.g., Kathmandu, Pokhara)..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowResults(true)}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm outline-none transition placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setShowResults(false);
              setResults([]);
            }}
            className="absolute right-2.5 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showResults && (query || isSearching) && (
        <div className="absolute top-11 z-50 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
          {isSearching ? (
            <div className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </div>
          ) : results.length > 0 ? (
            <ul className="max-h-64 overflow-y-auto">
              {results.map((result) => (
                <li key={result.place_id}>
                  <button
                    type="button"
                    onClick={() => handleSelectResult(result)}
                    className="w-full border-b border-slate-100 px-4 py-2.5 text-left text-sm transition hover:bg-slate-50 last:border-b-0"
                  >
                    <p className="font-medium text-slate-900">{result.name}</p>
                    <p className="text-xs text-slate-600">
                      {result.display_name}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-slate-600">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LocationPickerMap({
  latitude,
  longitude,
  onPick,
}: LocationPickerMapProps) {
  const [mode, setMode] = useState<MapMode>("normal");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const hasPickedPoint = latitude !== 0 || longitude !== 0;
  const currentCenter: [number, number] = useMemo(() => {
    if (hasPickedPoint) {
      return [latitude, longitude];
    }
    return NEPAL_CENTER;
  }, [hasPickedPoint, latitude, longitude]);

  const tile =
    mode === "satellite"
      ? {
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          attribution:
            '&copy; <a href="https://www.esri.com/">Esri</a> | Source: Esri, Maxar, Earthstar Geographics',
        }
      : {
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="space-y-3 border-b border-slate-200 px-4 py-4">
        <PlaceSearchBox
          onSelectPlace={(lat, lon) => {
            onPick(lat, lon);
          }}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Pick Location on Map
            </p>
            <p className="text-xs text-slate-600">
              Select mode, then click anywhere to auto-fill latitude and
              longitude.
            </p>
          </div>
          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setMode("normal")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                mode === "normal"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                Normal view
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMode("satellite")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                mode === "satellite"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Satellite view
            </button>
          </div>
        </div>
      </div>

      {isMounted ? (
        <MapContainer
          center={currentCenter}
          zoom={hasPickedPoint ? 13 : 7}
          scrollWheelZoom
          className="h-90 w-full"
        >
          <TileLayer attribution={tile.attribution} url={tile.url} />
          <MapClickHandler onPick={onPick} />
          <RecenterMap center={currentCenter} />

          {hasPickedPoint && (
            <CircleMarker
              center={[latitude, longitude]}
              radius={10}
              pathOptions={{
                color: "#0f4272",
                fillColor: "#0f4272",
                fillOpacity: 0.36,
              }}
            >
              <Popup>
                <div className="text-xs font-medium text-slate-700">
                  Latitude: {latitude.toFixed(6)}
                  <br />
                  Longitude: {longitude.toFixed(6)}
                </div>
              </Popup>
            </CircleMarker>
          )}
        </MapContainer>
      ) : (
        <div className="h-90 w-full animate-pulse rounded-lg bg-slate-200" />
      )}
    </div>
  );
}
