"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function NavBar() {
  const { data: session } = useSession();

  return (
    <nav className="flex items-center space-x-4">
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
      {session?.user ? (
        <Link
          href="/profile"
          className="px-3 py-2 rounded-md text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20"
        >
          Profile
        </Link>
      ) : (
        <Link
          href="/login"
          className="px-3 py-2 rounded-md text-sm font-medium bg-primary text-white hover:bg-primary/90"
        >
          Sign in
        </Link>
      )}
    </nav>
  );
}
