export type CategoryTheme = {
  slug: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
  accent: string;
};

const themes: Record<string, CategoryTheme> = {
  politics: {
    slug: "politics",
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
    dot: "bg-red-600",
    accent: "#DC2626",
  },
  economy: {
    slug: "economy",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    dot: "bg-emerald-600",
    accent: "#059669",
  },
  technology: {
    slug: "technology",
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    dot: "bg-blue-600",
    accent: "#2563EB",
  },
  culture: {
    slug: "culture",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    dot: "bg-amber-600",
    accent: "#D97706",
  },
  sports: {
    slug: "sports",
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
    dot: "bg-rose-600",
    accent: "#E11D48",
  },
};

const defaultTheme: CategoryTheme = {
  slug: "general",
  bg: "bg-slate-100",
  text: "text-slate-800",
  border: "border-slate-200",
  dot: "bg-slate-600",
  accent: "#475569",
};

export function getCategoryTheme(categorySlug: string): CategoryTheme {
  const key = categorySlug.toLowerCase();
  return themes[key] || defaultTheme;
}
