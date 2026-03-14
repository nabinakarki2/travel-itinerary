"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelectedPlaces } from "@/app/context/SelectedPlacesContext";
import type { PlaceResult } from "@/actions/search";

const FALLBACK_ROUTE_PLACES: PlaceResult[] = [
  {
    place_id: 16,
    name: "Lumbini",
    description:
      "Lumbini – Temple – Rupandehi – Lumbini – The birthplace of Lord Buddha, featuring the Maya Devi Temple and various international monasteries.",
    district: "Rupandehi",
    state: "Lumbini",
    type: "Temple",
    latitude: 27.4705,
    longitude: 83.2758,
    $similarity: 0.858107,
  },
  {
    place_id: 73,
    name: "Resunga Hill",
    description:
      "Resunga Hill – Hill – Gulmi – Lumbini – Resunga Hill is a sacred site associated with ancient sages and legends. It offers peaceful forests, temples, and views of surrounding hills.",
    district: "Gulmi",
    state: "Lumbini",
    type: "Hill",
    latitude: 28.08,
    longitude: 83.24,
    $similarity: 0.8255776,
  },
  {
    place_id: 49,
    name: "Muktinath Temple",
    description:
      "Muktinath Temple – Religious Site – Mustang – Gandaki – Muktinath Temple is a sacred pilgrimage site for both Hindus and Buddhists located at the base of Thorong La Pass in Mustang. The temple complex includes 108 water spouts where pilgrims bathe for purification. Surrounded by dramatic Himalayan scenery, the site symbolizes spiritual liberation and attracts visitors year-round.",
    district: "Mustang",
    state: "Gandaki",
    type: "Religious Site",
    latitude: 28.816,
    longitude: 83.872,
    $similarity: 0.8461641,
  },
  {
    place_id: 33,
    name: "Lo Manthang",
    description:
      "Lo Manthang – Historic City – Mustang – Gandaki – Lo Manthang is the ancient walled capital of the former Kingdom of Mustang in northern Nepal. Surrounded by dramatic desert landscapes and towering Himalayan peaks, the city preserves centuries-old Tibetan Buddhist culture and architecture. The town is famous for its whitewashed mud-brick houses, royal palace, and ancient monasteries decorated with colorful murals. Visitors can explore narrow alleyways, traditional homes, and cultural sites that reflect the region’s unique heritage. Because Mustang remained isolated for many years, Lo Manthang retains a distinct identity that blends Nepali and Tibetan traditions, making it one of the most fascinating destinations in the Himalayas.",
    district: "Mustang",
    state: "Gandaki",
    type: "Historic City",
    latitude: 29.1794,
    longitude: 83.962,
    $similarity: 0.8321701,
  },
  {
    place_id: 77,
    name: "Tikapur Park",
    description:
      "Tikapur Park – Park – Kailali – Sudurpashchim – Tikapur Park is a beautiful riverside park known for gardens, picnic areas, and views of the Karnali River bridge. It is a popular relaxation spot for locals.",
    district: "Kailali",
    state: "Sudurpashchim",
    type: "Park",
    latitude: 28.53,
    longitude: 81.12,
    $similarity: 0.831318,
  },
];

export default function NavBar() {
  const router = useRouter();
  const { clearPlaces, addPlace } = useSelectedPlaces();

  const handleRouteClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    clearPlaces();
    FALLBACK_ROUTE_PLACES.forEach((place) => addPlace(place));

    router.push("/route");
  };

  return (
    <nav className="flex space-x-4">
      <Link
        href="/"
        className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/80"
      >
        Home
      </Link>
      <Link
        href="/planner"
        className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/80"
      >
        Planner
      </Link>
      <Link
        href="/local-guide"
        className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/80"
      >
        Local Guide
      </Link>
      <a
        href="/route"
        onClick={handleRouteClick}
        className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/80"
      >
        Route
      </a>
    </nav>
  );
}
