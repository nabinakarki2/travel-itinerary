import Image from "next/image";

const steps = [
  {
    title: "Start the Chat",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    description:
      "Begin from Butwal (or your hometown) and message our bot. Add places it recommends or type your own spots like temples and parks.",
    detail: "Interactive place selection",
  },
  {
    title: "Pick Stays & Partners",
    image:
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80",
    description:
      "Once your list is ready, choose hotels, restaurants, and travel partners suggested for each location.",
    detail: "Hotels, eats & transport",
  },
  {
    title: "Confirm & View Route",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    description:
      "Lock in your itinerary and see a proper map displaying the shortest path covering all chosen sites.",
    detail: "Complete itinerary with map",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="relative overflow-hidden bg-white py-25">
      <div
        className="pointer-events-none absolute -left-10 top-8 h-40 w-40 rounded-full bg-primary/10 blur-[80px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-6 top-32 h-32 w-32 rounded-full bg-primary/10 blur-[100px]"
        aria-hidden="true"
      />
      <div className="mx-auto max-w-300 px-4 md:px-6">
        <header className="mb-10 md:mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-gray-600">
            Chat your way through planning and get a ready map — domestic travel
            simplified step by step.
          </p>
        </header>

        <ol className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="pointer-events-none absolute inset-x-0 top-1/2 hidden h-10 md:block">
            <span className="mx-auto block h-1 w-2/3 rounded-full bg-primary/10" />
          </div>
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="relative overflow-hidden rounded-[28px] border border-primary/15 bg-white"
            >
              <div className="relative h-52 w-full overflow-hidden">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm text-gray-600">
                  {step.description}
                </p>
                <div className="mt-6 text-sm font-semibold text-primary">
                  {step.detail}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
