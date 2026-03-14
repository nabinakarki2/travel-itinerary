export type Coordinates = {
  lat: number;
  lon: number;
};

export type RouteOption = {
  label: string;
  value: number;
  imageUrl?: string;
  tag?: string;
  icon?: "airport" | "location";
  coords?: Coordinates;
};

export type GraphPoint = {
  id: string;
  label: string;
  lat: number;
  lon: number;
  kind: "place" | "airport" | "current";
};
