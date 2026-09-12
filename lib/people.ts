import "server-only";
import { cache } from "react";
import { readLocalEmployees } from "./employees.mjs";
import { sanityClient, publishedEmployees } from "./sanity.mjs";

export type Employee = {
  _id: string;
  slug: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  responsibilities: string[];
  updated: string;
};
export const getEmployees = cache(async (): Promise<Employee[]> => {
  const people =
    process.env.CONTENT_SOURCE === "sanity"
      ? await sanityClient().fetch(
          `*[${publishedEmployees}] | order(name asc) {_id,slug,name,role,department,bio,responsibilities,updated}`,
          {},
          { cache: "no-store" },
        )
      : await readLocalEmployees();
  return people.sort((a: Employee, b: Employee) =>
    a.name.localeCompare(b.name),
  );
});
