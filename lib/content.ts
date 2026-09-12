import "server-only";
import { cache } from "react";
import { loader, type VirtualFile } from "fumadocs-core/source";
import { createElement } from "react";
import { Users } from "lucide-react";
import { getEmployees } from "./people";
import { employeePage } from "./employees.mjs";
import { departments } from "./company";
import { readLocalPages } from "./local-content.mjs";
import { pageFields, publishedPages, sanityClient } from "./sanity.mjs";

export type KnowledgePage = {
  _id: string;
  title: string;
  description: string;
  slug: string;
  department: string;
  owner: string;
  ownerSlug?: string;
  updated: string;
  body: string;
  order: number;
};

export const usingSanity = process.env.CONTENT_SOURCE === "sanity";

export const getPages = cache(async (): Promise<KnowledgePage[]> => {
  if (!usingSanity) return readLocalPages();
  // One source of truth. A Sanity error never silently serves stale local pages.
  return sanityClient().fetch(
    `*[${publishedPages}] | order(order asc, title asc) {${pageFields}}`,
    {},
    { cache: "no-store" },
  );
});

export const getSource = cache(async () => {
  const pages = await getPages();
  const allPages = [...pages, ...(await getEmployees()).map(employeePage)];
  const files: VirtualFile[] = allPages.map((page) => ({
    type: "page",
    path: `${page.slug || "index"}.md`,
    slugs: page.slug ? page.slug.split("/") : [],
    data: page,
  }));
  files.push({
    type: "meta",
    path: "meta.json",
    data: {
      pages: [
        "index",
        "[team][Team directory](/docs/team)",
        ...departments.map((d) => d.slug),
      ],
    },
  });
  for (const department of departments) {
    files.push({
      type: "meta",
      path: `${department.slug}/meta.json`,
      data: {
        title: department.name,
        icon: department.slug,
        pages: pages
          .filter((p) => p.department === department.slug)
          .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
          .map((p) => p.slug.split("/").at(-1)!),
      },
    });
  }
  return loader({
    baseUrl: "/docs",
    source: { files },
    icon(name) {
      if (name === "team") return createElement(Users);
      const department = departments.find((d) => d.slug === name);
      if (department) return createElement(department.icon);
    },
  });
});
