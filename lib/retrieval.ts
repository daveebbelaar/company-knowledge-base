import "server-only";
import { getEmployees } from "./people";
import { employeePage } from "./employees.mjs";
import { getPages, usingSanity, type KnowledgePage } from "./content";
import { sanityClient, searchQuery } from "./sanity.mjs";

export type SearchMode = "keyword" | "semantic" | "hybrid";

export async function searchKnowledge(
  query: string,
  mode: SearchMode = "hybrid",
): Promise<KnowledgePage[]> {
  if (usingSanity) {
    return sanityClient().fetch(
      searchQuery(mode),
      { searchText: query },
      { cache: "no-store", timeout: 15000 },
    );
  }
  const words = query.toLowerCase().split(/\s+/);
  return [...(await getPages()), ...(await getEmployees()).map(employeePage)]
    .map((page) => ({
      ...page,
      _score: words.reduce(
        (sum, word) =>
          sum +
          (page.title.toLowerCase().includes(word) ? 3 : 0) +
          (`${page.description} ${page.body}`.toLowerCase().includes(word)
            ? 1
            : 0),
        0,
      ),
    }))
    .filter((p) => p._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 8);
}

export function pageUrl(slug: string) {
  return `/docs${slug ? `/${slug}` : ""}`;
}
