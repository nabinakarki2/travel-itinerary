import { NextResponse } from "next/server";

type OsrmTableRequest = {
  points?: Array<{
    lat: number;
    lon: number;
  }>;
};

type OsrmTableResponse = {
  code?: string;
  distances?: Array<Array<number | null>>;
  message?: string;
};

const OSRM_BASE_URL = "https://router.project-osrm.org";
const MAX_POINTS = 25;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OsrmTableRequest;
    const points = Array.isArray(body.points) ? body.points : [];

    if (points.length < 2) {
      return NextResponse.json(
        { error: "At least two points are required." },
        { status: 400 },
      );
    }

    if (points.length > MAX_POINTS) {
      return NextResponse.json(
        {
          error: `Too many points. Maximum supported points per request is ${MAX_POINTS}.`,
        },
        { status: 400 },
      );
    }

    const hasInvalidPoint = points.some(
      (p) =>
        typeof p.lat !== "number" ||
        typeof p.lon !== "number" ||
        !Number.isFinite(p.lat) ||
        !Number.isFinite(p.lon),
    );

    if (hasInvalidPoint) {
      return NextResponse.json(
        { error: "All points must contain valid numeric lat/lon." },
        { status: 400 },
      );
    }

    const coordinates = points.map((p) => `${p.lon},${p.lat}`).join(";");

    const url = `${OSRM_BASE_URL}/table/v1/driving/${coordinates}?annotations=distance`;

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "OSRM table request failed." },
        { status: 502 },
      );
    }

    const data = (await response.json()) as OsrmTableResponse;

    if (data.code !== "Ok" || !Array.isArray(data.distances)) {
      return NextResponse.json(
        {
          error: data.message || "OSRM did not return a valid distance matrix.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ distances: data.distances });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while requesting OSRM.",
      },
      { status: 500 },
    );
  }
}
