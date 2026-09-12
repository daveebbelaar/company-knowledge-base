import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

// Plain Markdown is shared by the local reader and the one-time Sanity import.
export async function readLocalPages() {
  const root = path.join(process.cwd(), "content/docs");
  const files = (await readdir(root, { recursive: true }))
    .filter((file) => file.endsWith(".md"))
    .sort();
  return Promise.all(
    files.map(async (file) => {
      const { data, content } = matter(
        await readFile(path.join(root, file), "utf8"),
      );
      const slug = file
        .replaceAll(path.sep, "/")
        .replace(/\.md$/, "")
        .replace(/(^|\/)index$/, "");
      for (const key of ["title", "description", "owner", "updated"]) {
        if (typeof data[key] !== "string")
          throw new Error(`${file}: ${key} must be a quoted string`);
      }
      return {
        _id: `knowledge.${slug.replaceAll("/", ".") || "index"}`,
        _type: "knowledgePage",
        slug,
        title: data.title,
        description: data.description,
        department: slug.split("/")[0] || "company",
        owner: data.owner,
        updated: data.updated,
        body: content.trim(),
        order: Number(data.order ?? 10),
      };
    }),
  );
}
