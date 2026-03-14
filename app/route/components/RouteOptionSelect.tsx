"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Plane } from "lucide-react";
import type { RouteOption } from "@/app/route/components/types";

type RouteOptionSelectProps = {
  label: string;
  value: number | null;
  options: RouteOption[];
  placeholder?: string;
  onChange: (value: number | null) => void;
};

function OptionLeadingVisual({ option }: { option: RouteOption }) {
  if (option.imageUrl) {
    return (
      <img
        src={option.imageUrl}
        alt={option.label}
        className="h-10 w-10 rounded-lg object-cover ring-1 ring-slate-200"
      />
    );
  }

  if (option.icon === "airport") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-700 ring-1 ring-sky-200">
        <Plane className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 ring-1 ring-slate-200">
      <MapPin className="h-4 w-4" />
    </div>
  );
}

export default function RouteOptionSelect({
  label,
  value,
  options,
  placeholder = "Select...",
  onChange,
}: RouteOptionSelectProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedLabel = options.find((opt) => opt.value === value)?.label;
  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = useMemo(() => {
    if (!filter.trim()) return options;
    const query = filter.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(query));
  }, [filter, options]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <div className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {selectedOption ? (
            <div className="flex min-w-0 items-center gap-3">
              <OptionLeadingVisual option={selectedOption} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">
                  {selectedOption.label}
                </p>
                {selectedOption.tag ? (
                  <p className="truncate text-xs text-slate-500">
                    {selectedOption.tag}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <span className="truncate text-slate-500">
              {selectedLabel ?? placeholder}
            </span>
          )}
          <span className="text-slate-400">▾</span>
        </button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-2 max-h-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 px-3 py-2">
            <input
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Search..."
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-52 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500">No results</div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-slate-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <OptionLeadingVisual option={opt} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {opt.label}
                      </p>
                      {opt.tag ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                          {opt.tag}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {opt.value === value ? (
                    <span className="text-primary">✓</span>
                  ) : null}
                </button>
              ))
            )}
          </div>
          <div className="border-t border-slate-100 px-3 py-2">
            <button
              type="button"
              className="w-full rounded-lg bg-slate-50 px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-100"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
            >
              Clear selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
