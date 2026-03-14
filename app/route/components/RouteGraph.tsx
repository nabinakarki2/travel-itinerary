"use client";

import { useMemo } from "react";
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  type Edge as RFEdge,
  type Node as RFNode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { PlaceDetail } from "@/actions/getPlacesByIds";
import type {
  Coordinates,
  GraphPoint,
  RouteOption,
} from "@/app/route/components/types";

type RouteGraphProps = {
  places: PlaceDetail[];
  startId: number | null;
  endId: number | null;
  currentLocation: Coordinates | null;
  airportOption: RouteOption;
  currentLocationOption: RouteOption;
};

export default function RouteGraph({
  places,
  startId,
  endId,
  currentLocation,
  airportOption,
  currentLocationOption,
}: RouteGraphProps) {
  const optionToNodeId = (value: number | null): string | null => {
    if (value == null) return null;
    if (value === -1) return "airport";
    if (value === -2) return currentLocation ? "current" : null;
    return `place-${value}`;
  };

  const graphPoints = useMemo<GraphPoint[]>(() => {
    const points: GraphPoint[] = [];

    for (const place of places) {
      if (place.latitude == null || place.longitude == null) continue;
      points.push({
        id: `place-${place.id}`,
        label: place.name,
        lat: place.latitude,
        lon: place.longitude,
        kind: "place",
      });
    }

    if (startId === -1 || endId === -1) {
      if (airportOption.coords) {
        points.push({
          id: "airport",
          label: airportOption.label,
          lat: airportOption.coords.lat,
          lon: airportOption.coords.lon,
          kind: "airport",
        });
      }
    }

    if ((startId === -2 || endId === -2) && currentLocation) {
      points.push({
        id: "current",
        label: currentLocationOption.label,
        lat: currentLocation.lat,
        lon: currentLocation.lon,
        kind: "current",
      });
    }

    const unique = new Map<string, GraphPoint>();
    points.forEach((point) => unique.set(point.id, point));
    return [...unique.values()];
  }, [
    airportOption.coords,
    airportOption.label,
    currentLocation,
    currentLocationOption.label,
    endId,
    places,
    startId,
  ]);

  const highlightedEdgeKey = useMemo(() => {
    const a = optionToNodeId(startId);
    const b = optionToNodeId(endId);
    if (!a || !b) return null;
    return [a, b].sort().join("--");
  }, [endId, startId, currentLocation]);

  const graphNodes = useMemo<RFNode[]>(() => {
    if (graphPoints.length === 0) return [];

    const lats = graphPoints.map((p) => p.lat);
    const lons = graphPoints.map((p) => p.lon);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    const spanLat = Math.max(maxLat - minLat, 0.01);
    const spanLon = Math.max(maxLon - minLon, 0.01);
    const width = 900;
    const height = 420;
    const padding = 50;

    return graphPoints.map((point) => {
      const x =
        padding + ((point.lon - minLon) / spanLon) * (width - padding * 2);
      const y =
        padding + (1 - (point.lat - minLat) / spanLat) * (height - padding * 2);

      return {
        id: point.id,
        position: { x, y },
        draggable: false,
        data: { label: point.label },
        style: {
          background:
            point.kind === "airport"
              ? "#e0f2fe"
              : point.kind === "current"
                ? "#f1f5f9"
                : "#ffffff",
          borderColor:
            point.kind === "airport"
              ? "#0284c7"
              : point.kind === "current"
                ? "#475569"
                : "#94a3b8",
          borderWidth: 1.5,
          borderStyle: "solid",
          borderRadius: 16,
          padding: 10,
          fontSize: 12,
          fontWeight: 600,
          color: "#0f172a",
          boxShadow: "0 8px 20px rgba(2, 6, 23, 0.08)",
        },
      } satisfies RFNode;
    });
  }, [graphPoints]);

  const graphEdges = useMemo<RFEdge[]>(() => {
    const edges: RFEdge[] = [];

    const haversineKm = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number,
    ) => {
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    for (let i = 0; i < graphPoints.length; i += 1) {
      for (let j = i + 1; j < graphPoints.length; j += 1) {
        const sourcePoint = graphPoints[i];
        const targetPoint = graphPoints[j];
        const edgeKey = [sourcePoint.id, targetPoint.id].sort().join("--");
        const distance = haversineKm(
          sourcePoint.lat,
          sourcePoint.lon,
          targetPoint.lat,
          targetPoint.lon,
        );
        const isHighlighted = edgeKey === highlightedEdgeKey;

        edges.push({
          id: edgeKey,
          source: sourcePoint.id,
          target: targetPoint.id,
          label: `${distance.toFixed(1)} km`,
          type: "straight",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isHighlighted ? "#16a34a" : "#94a3b8",
            width: 18,
            height: 18,
          },
          style: {
            stroke: isHighlighted ? "#16a34a" : "#94a3b8",
            strokeWidth: isHighlighted ? 3 : 1.2,
          },
          labelStyle: {
            fontSize: 11,
            fontWeight: 600,
            fill: isHighlighted ? "#166534" : "#64748b",
          },
          labelBgStyle: {
            fill: "#ffffff",
            fillOpacity: 0.9,
          },
          labelBgBorderRadius: 6,
          labelBgPadding: [5, 4],
        });
      }
    }

    return edges;
  }, [graphPoints, highlightedEdgeKey]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Network Graph (React Flow)
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        All places are connected to each other with weighted edges (distance in
        km). The selected route is highlighted in green.
      </p>
      <div className="mt-4 h-[460px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        {graphNodes.length >= 2 ? (
          <ReactFlow
            nodes={graphNodes}
            edges={graphEdges}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            defaultEdgeOptions={{ animated: false }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#cbd5e1" gap={18} />
            <Controls showInteractive={false} />
          </ReactFlow>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            At least two places with coordinates are needed to render the graph.
          </div>
        )}
      </div>
    </div>
  );
}
