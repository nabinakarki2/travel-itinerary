import {
  MessageCircle,
  Map,
  Hotel,
  Users,
  Shield,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "Chat-Based Planning",
    description:
      "Describe your dream trip to our bot and watch your itinerary build itself — no complex forms, just natural conversation.",
  },
  {
    icon: Map,
    title: "Smart Route Optimization",
    description:
      "Our branch-and-bound algorithm finds the most efficient path through all your destinations, minimizing travel time.",
  },
  {
    icon: Hotel,
    title: "Curated Accommodations",
    description:
      "Handpicked hotels and guesthouses near each stop, with real reviews and direct booking links.",
  },
  {
    icon: Users,
    title: "Local Guide Contributions",
    description:
      "Community-sourced recommendations mean you discover authentic spots that guidebooks miss.",
  },
  {
    icon: Shield,
    title: "Verified Partners",
    description:
      "Every hotel, restaurant, and transport partner is verified for quality and reliability.",
  },
  {
    icon: Zap,
    title: "Instant Itinerary Maps",
    description:
      "See your entire trip laid out on an interactive map — with distances, estimated times, and alternate routes.",
  },
];

export default function FeaturesGridSection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-300 px-4 md:px-6">
        <header className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Everything You{" "}
            <span className="text-primary">Need to Travel</span>
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-gray-600">
            From chat-based planning to optimized routing — we&apos;ve got your
            entire trip covered.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-primary/10 bg-white p-6 transition hover:border-primary/20 hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
