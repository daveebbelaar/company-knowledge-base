# Company knowledge base

1. Read README.md before changing the app. Identify whether the requested change belongs to local Markdown, Sanity content, or the shared rendering and search code.
2. Keep the build explainable in a 20-minute walkthrough. Use the existing Fumadocs components and plain Markdown. Finish with one source of truth per mode.
3. Run the checks listed in package.json after code changes. For UI changes, also check the homepage, a docs page, and the search overlay in the browser.

## Content

Vellumridge Technology and its people, product, and policies are fictional. Keep examples short, concrete, and consistent across departments. Each page needs an owner and a quoted review date. Run the content test after adding links.

Local mode reads content/docs. Sanity mode reads published knowledgePage documents for both pages and search. The import only creates missing IDs; it must never overwrite Studio edits or become a background sync job.

## Boundaries

Keep API credentials server-side and .env ignored. The website uses a shared-password demo gate, not individual accounts or department permissions. Preserve protection of pages and /api/search. Never execute remotely authored MDX or HTML.

Framework changes: consult the installed guides under node_modules/next/dist/docs. Fumadocs supplies the classic DocsLayout and search components; avoid building replacements.

Recording changes: docs/recording-guide.md contains the walkthrough order and tested search examples.
