import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "https://images.unsplash.com/photo-1543004218-ee141104975a?q=80&w=200&h=300&auto=format&fit=crop"
  if (path.startsWith("http")) return path
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://bibliotheque-emprunts.onrender.com"
  // Remove trailing slash from API URL if exists and leading slash from path if exists to avoid double slashes
  const cleanApiUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  return `${cleanApiUrl}${cleanPath}`
}
