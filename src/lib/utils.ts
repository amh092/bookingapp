// clsx: joins class names together and skips falsy values (false, null, undefined)
// twMerge: resolves conflicting Tailwind classes, keeping only the one that should win
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// cn(): combines class names safely, e.g. cn("px-4 bg-blue-500", className)
// Used by shadcn/ui components to merge default styles with a passed-in className prop.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
