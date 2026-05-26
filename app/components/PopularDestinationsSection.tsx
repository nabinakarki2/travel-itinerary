import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, StarHalf } from "lucide-react";

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: full }, (_, i) => (
        <Star key={`full-${i}`} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      ))}
      {half && <StarHalf className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
      {Array.from({ length: empty }, (_, i) => (
        <Star key={`empty-${i}`} className="h-3.5 w-3.5 text-amber-200" />
      ))}
    </span>
  );
}

const destinations = [
  {
    name: "Muktinath Temple",
    location: "Mustang",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1604537529428-15bcbeecfe4d?w=800&q=80",
    tag: "Religious",
  },
  {
    name: "Resunga Hill",
    location: "Gulmi",
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800&q=80",
    tag: "Trekking",
  },
  {
    name: "Shiva Temple – Palpa",
    location: "Palpa",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1566837945700-30057527ade0?w=800&q=80",
    tag: "Religious",
  },
  {
    name: "Ghalegaun",
    location: "Lamjung",
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    tag: "Village",
  },
  {
    name: "Chitwan National Park",
    location: "Chitwan",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1549366021-9f761c450615?w=800&q=80",
    tag: "Wildlife",
  },
  {
    name: "Phewa Lake",
    location: "Pokhara",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80",
    tag: "Scenic",
  },
];

export default function PopularDestinationsSection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-300 px-4 md:px-6">
        <header className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Popular <span className="text-primary">Destinations</span>
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-gray-600">
            Explore Nepal&apos;s most beloved destinations — from sacred temples
            to breathtaking hills.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((dest) => (
            <Link
              key={dest.name}
              href={`/planner?q=${encodeURIComponent(dest.name)}`}
              className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-white transition hover:shadow-lg"
            >
              <div className="relative h-52 w-full overflow-hidden">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                  {dest.tag}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {dest.name}
                </h3>
                <div className="mt-1 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {dest.location}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-600">
                    <StarRating rating={dest.rating} />
                    {dest.rating}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/planner"
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-8 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
          >
            Discover All Destinations
          </Link>
        </div>
      </div>
    </section>
  );
}
