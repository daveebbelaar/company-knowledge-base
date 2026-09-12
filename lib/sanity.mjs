import { createClient } from "@sanity/client";

export function sanityClient() {
  const {
    SANITY_STUDIO_PROJECT_ID: projectId,
    SANITY_API_KEY: token,
    SANITY_STUDIO_DATASET: dataset,
  } = process.env;
  if (!projectId || !token || !dataset)
    throw new Error(
      "Set SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET and SANITY_API_KEY in .env.",
    );
  return createClient({
    projectId,
    dataset,
    token,
    apiVersion: process.env.SANITY_API_VERSION || "2025-02-19",
    useCdn: false,
    perspective: "published",
  });
}

export const pageFields =
  '_id, title, description, slug, department, "owner": coalesce(ownerProfile->name, owner), "ownerSlug": ownerProfile->slug, updated, body, order';
export const publishedPages =
  '_type == "knowledgePage" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))';

export const publishedEmployees =
  '_type == "employee" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))';
export const embeddingsProjection =
  "{ title, description, department, body, name, role, bio, responsibilities }";

export function searchQuery(mode = "hybrid") {
  const keyword =
    "boost(([title, description, body, name, role, bio] match text::query($searchText)) || (responsibilities match text::query($searchText)), 0.5)";
  const semantic = "text::semanticSimilarity($searchText)";
  const scoring =
    mode === "keyword"
      ? keyword
      : mode === "semantic"
        ? semantic
        : `${keyword}, ${semantic}`;
  return `*[(${publishedPages}) || (${publishedEmployees})]
    | score(${scoring})
    | order(_score desc)[_score > 0][0...8]
    { _id, "title": coalesce(title, name), "description": coalesce(description, role),
      "slug": select(_type == "employee" => "team/" + slug, slug), department,
      "owner": coalesce(ownerProfile->name, owner, name), updated, order,
      "body": coalesce(body, name + " is the " + role + ". " + bio + " Responsibilities: " + array::join(responsibilities, "; ")), _score }`;
}
