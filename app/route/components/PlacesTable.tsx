"use client";

import type { PlaceDetail } from "@/actions/getPlacesByIds";

type PlacesTableProps = {
  places: PlaceDetail[];
};

export default function PlacesTable({ places }: PlacesTableProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Places</h2>
      <p className="mt-2 text-sm text-slate-600">
        Quick list of selected places (name + coordinates).
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="py-2">Name</th>
              <th className="py-2">Latitude</th>
              <th className="py-2">Longitude</th>
            </tr>
          </thead>
          <tbody>
            {places.map((place) => (
              <tr key={place.id} className="border-b border-slate-100">
                <td className="py-2 font-medium text-slate-900">
                  {place.name}
                </td>
                <td className="py-2 text-slate-600">
                  {place.latitude != null ? place.latitude.toFixed(6) : "—"}
                </td>
                <td className="py-2 text-slate-600">
                  {place.longitude != null ? place.longitude.toFixed(6) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
