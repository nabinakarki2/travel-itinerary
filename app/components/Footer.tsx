import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const links = [
  { label: "Start Planning", href: "/planner" },
  { label: "Local Guide", href: "/local-guide" },
  { label: "Sign In", href: "/login" },
];

export default function Footer() {
  return (
    <footer className="bg-[#f4f8ff]">
      <div className="mx-auto max-w-300 px-4 md:px-6">
        <div className="relative grid gap-10 py-16 md:grid-cols-[2fr_1fr] md:py-20">
          <div>
            <p className="mt-4 max-w-md text-2xl leading-snug text-gray-900 md:text-3xl md:leading-tight">
              Nepal is not a place you visit.
              <br />
              <span className="text-primary">
                It is a place you come back to.
              </span>
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-500">
              From the temples of Mustang to the trails of Gulmi plan your
              journey with local knowledge, not guesswork.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end md:justify-end">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 transition hover:text-primary"
              >
                {link.label}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-gray-200 py-6 md:flex-row md:items-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Travel Itinerary
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Butwal, Nepal</span>
            <span className="h-3 w-px bg-gray-300" />
            <a
              href="mailto:hello@travelitinerary.com"
              className="transition hover:text-gray-700"
            >
              hello@travelitinerary.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
