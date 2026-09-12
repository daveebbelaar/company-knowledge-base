import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export async function readLocalEmployees() {
  const root = path.join(process.cwd(), "content/employees");
  return Promise.all(
    (await readdir(root))
      .filter((file) => file.endsWith(".json"))
      .sort()
      .map(async (file) => {
        const person = JSON.parse(
          await readFile(path.join(root, file), "utf8"),
        );
        for (const field of [
          "_id",
          "name",
          "role",
          "slug",
          "department",
          "bio",
          "updated",
        ])
          if (typeof person[field] !== "string" || !person[field].trim())
            throw Error(`${file}: missing ${field}`);
        if (
          !/^[a-z0-9-]+$/.test(person.slug) ||
          !Array.isArray(person.responsibilities) ||
          !person.responsibilities.length ||
          person.responsibilities.some(
            (item) => typeof item !== "string" || !item.trim(),
          )
        )
          throw Error(`${file}: invalid profile`);
        return person;
      }),
  );
}

// Profiles use the same reading and search shape as handbook pages.
export function employeePage(person) {
  return {
    _id: person._id,
    title: person.name,
    description: person.role,
    slug: `team/${person.slug}`,
    department: person.department,
    owner: person.name,
    updated: person.updated,
    order: 100,
    body: `${person.name} is the ${person.role}.\n\n${person.bio}\n\n## Ask me about\n\n${person.responsibilities.map((item) => `- ${item}`).join("\n")}`,
  };
}
