import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { knowledgePage, employee } from "./sanity/schema";

export default defineConfig({
  name: "knowledge",
  title: "Vellumridge handbook",
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || "",
  dataset: process.env.SANITY_STUDIO_DATASET || "knowledge",
  plugins: [structureTool()],
  schema: { types: [knowledgePage, employee] },
});
