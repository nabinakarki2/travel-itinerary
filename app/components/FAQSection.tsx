"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How do I start planning a trip?",
    a: "Simply head to the Planner page and start chatting with our guide bot. Tell it where you want to go or what kind of places you like, and it will suggest destinations, temples, parks, and hidden gems along the way.",
  },
  {
    q: "Can I add my own places?",
    a: "Yes. During the chat you can type any location you know. The bot will add it to your itinerary so no spot gets left out.",
  },
  {
    q: "How are hotels and transport partners suggested?",
    a: "Once your place list is ready, the system recommends hotels, restaurants, and travel partners near each location. You pick what works for your budget and preferences.",
  },
  {
    q: "Is the route really optimized?",
    a: "Absolutely. Our algorithm calculates the shortest possible route that covers all your chosen spots, saving you time and fuel — perfect for road trips within Nepal.",
  },
  {
    q: "Do I need to create an account?",
    a: "You can browse and explore without an account. To save itineraries, add reviews, or contribute as a local guide, a quick registration is all it takes.",
  },
  {
    q: "How can I contribute as a local guide?",
    a: "Navigate to the Local Guide page, sign up, and you can submit new places, update information, and help other travelers discover authentic spots.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-[#f4f8ff] py-24">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <header className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Frequently Asked{" "}
            <span className="text-primary">Questions</span>
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-gray-600">
            Everything you need to know about planning your domestic trip.
          </p>
        </header>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-primary/10 bg-white transition hover:border-primary/20"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <span className="pr-4 text-sm font-semibold text-gray-900 md:text-base">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-primary transition duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    isOpen ? "max-h-96 pb-5" : "max-h-0"
                  }`}
                >
                  <p className="px-5 text-sm leading-relaxed text-gray-600">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
