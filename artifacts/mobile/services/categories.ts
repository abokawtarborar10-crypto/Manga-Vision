export type MangaCategoryId =
  | "all"
  | "action"
  | "adventure"
  | "comedy"
  | "drama"
  | "fantasy"
  | "horror"
  | "isekai"
  | "mystery"
  | "romance"
  | "sci-fi"
  | "slice-of-life";

export interface MangaCategory {
  id: MangaCategoryId;
  labelKey: string;
  icon: string;
  aliases: string[];
}

export const MANGA_CATEGORIES: readonly MangaCategory[] = [
  { id: "all", labelKey: "categories.all", icon: "apps-outline", aliases: [] },
  { id: "action", labelKey: "categories.action", icon: "flash-outline", aliases: ["action"] },
  { id: "adventure", labelKey: "categories.adventure", icon: "compass-outline", aliases: ["adventure"] },
  { id: "comedy", labelKey: "categories.comedy", icon: "happy-outline", aliases: ["comedy"] },
  { id: "drama", labelKey: "categories.drama", icon: "film-outline", aliases: ["drama"] },
  { id: "fantasy", labelKey: "categories.fantasy", icon: "sparkles-outline", aliases: ["fantasy"] },
  { id: "horror", labelKey: "categories.horror", icon: "skull-outline", aliases: ["horror"] },
  { id: "isekai", labelKey: "categories.isekai", icon: "planet-outline", aliases: ["isekai"] },
  { id: "mystery", labelKey: "categories.mystery", icon: "search-outline", aliases: ["mystery"] },
  { id: "romance", labelKey: "categories.romance", icon: "heart-outline", aliases: ["romance", "romantic"] },
  { id: "sci-fi", labelKey: "categories.sciFi", icon: "rocket-outline", aliases: ["sci-fi", "science fiction", "scifi"] },
  { id: "slice-of-life", labelKey: "categories.sliceOfLife", icon: "cafe-outline", aliases: ["slice of life", "slice-of-life"] },
];

const CATEGORY_BY_ID = new Map(MANGA_CATEGORIES.map((category) => [category.id, category]));

export function getCategory(id: string | undefined): MangaCategory {
  return CATEGORY_BY_ID.get(id as MangaCategoryId) ?? MANGA_CATEGORIES[0];
}

export function matchesCategory(genres: string[] | undefined, categoryId: MangaCategoryId): boolean {
  if (categoryId === "all") return true;
  const category = getCategory(categoryId);
  const normalizedGenres = (genres ?? []).map((genre) =>
    genre.trim().toLowerCase().replace(/[–—]/g, "-"),
  );
  return category.aliases.some((alias) => normalizedGenres.includes(alias));
}