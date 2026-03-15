"use client";

import { useRouter } from "next/navigation";

const quickSearches = [
  { label: "Trecking", query: "Best Trecking Places" },
  { label: "Adventure", query: "Best Adventure Places" },
  { label: "Religious", query: "Best Religious Places" },
  { label: "Hiking", query: "Best Hiking Trails" },
  { label: "Refreshment", query: "Best Refreshment Places" },
  { label: "Mountains", query: "Best Mountain Places" },
];

export default function QuickSearchButtons() {
  const router = useRouter();

  const handleQuickSearch = (query: string) => {
    router.push(`/planner?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {quickSearches.map((item) => (
        <button
          key={item.label}
          onClick={() => handleQuickSearch(item.query)}
          className="px-4 py-2 rounded-full border-2 border-primary/40 text-slate-700 hover:bg-primary/10 hover:border-primary transition-all duration-200 font-medium text-sm md:text-base"
        >
          [{item.label}]
        </button>
      ))}
    </div>
  );
}
