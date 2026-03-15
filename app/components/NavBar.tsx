"use client";

import Link from "next/link";

export default function NavBar() {
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
    </nav>
  );
}
