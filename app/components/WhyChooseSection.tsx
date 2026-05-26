import Image from "next/image";

const trustItems = [
  {
    title: "Chat Bot Recommendations",
    description:
      "Interact with our bot to discover and add domestic attractions starting from Butwal or your city.",
    image: "/images/chat-bot-recommendations.png",
  },
  {
    title: "Local Guides",
    description:
      "Guides and community members can contribute new places so the database stays current.",
    image: "/images/local-guides.png",
  },
  {
    title: "Optimized Path",
    description:
      "A mapped itinerary calculates the shortest route that covers all your chosen spots.",
    image: "/images/optmized-path.png",
  },
  {
    title: "Complete Booking Flow",
    description:
      "Select hotels, restaurants and travel partners then confirm everything in one seamless process.",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  },
];

export default function WhyChooseSection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-300 px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.3fr,0.7fr]">
          <header className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Why <span className="text-primary">Choose</span> Our Planner
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-gray-600">
              Chat-driven recommendations, community guides, and smart route
              planning keep your domestic trips simple and enjoyable.
            </p>
          </header>
          <div className="grid gap-4 sm:grid-cols-2">
            {trustItems.map((item) => (
              <article
                key={item.title}
                className="relative flex h-full flex-col gap-4 rounded-2xl border border-primary/20 bg-white p-6"
              >
                <div className="relative h-60 w-full overflow-hidden rounded-xl">
                  <Image
                    src={item.image}
                    alt={item.title}
                    className="w-full h-ful object-cover"
                    width={400}
                    height={300}
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
