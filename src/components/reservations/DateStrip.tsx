"use client";

import { cn } from "@/lib/utils";

export interface StripDay {
  dateKey: string;
  dow: string;
  day: number;
  month: string;
  isToday: boolean;
  isClosed: boolean;
}

interface DateStripProps {
  days: StripDay[];
  selectedKey: string;
  onSelect: (dateKey: string) => void;
}

export function DateStrip({ days, selectedKey, onSelect }: DateStripProps) {
  return (
    <div
      role="group"
      aria-label="Choose a date"
      className="flex snap-x gap-2 overflow-x-auto pb-2"
    >
      {days.map((day) => (
        <button
          key={day.dateKey}
          type="button"
          disabled={day.isClosed}
          aria-pressed={day.dateKey === selectedKey}
          onClick={() => onSelect(day.dateKey)}
          className={cn(
            "group flex min-w-[4.5rem] snap-start flex-col items-center gap-0.5 rounded-xl border border-input bg-transparent px-3 py-2.5 transition-colors",
            "hover:border-primary/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
            "aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground",
            "disabled:pointer-events-none disabled:opacity-40"
          )}
        >
          <span
            className={cn(
              "text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase group-aria-pressed:text-primary-foreground/80",
              day.isClosed && "line-through"
            )}
          >
            {day.isToday ? "Today" : day.dow}
          </span>
          <span className="font-heading text-lg font-semibold">{day.day}</span>
          <span className="text-[0.7rem] text-muted-foreground group-aria-pressed:text-primary-foreground/80">
            {day.month}
          </span>
        </button>
      ))}
    </div>
  );
}
