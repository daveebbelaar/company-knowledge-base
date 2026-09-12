import { NextRequest, NextResponse } from "next/server";
import { usingSanity } from "@/lib/content";
import { searchKnowledge, type SearchMode } from "@/lib/retrieval";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim() || "";
  const mode = request.nextUrl.searchParams.get("mode") || "hybrid";
  if (query.length > 240 || !["keyword", "semantic", "hybrid"].includes(mode)) {
    return NextResponse.json(
      {
        error: "Use a query of at most 240 characters and a valid search mode.",
      },
      { status: 400 },
    );
  }
  if (query.length < 2)
    return NextResponse.json({
      results: [],
      source: usingSanity ? "sanity" : "local",
    });
  try {
    const results = await searchKnowledge(query, mode as SearchMode);
    return NextResponse.json(
      {
        source: usingSanity ? "sanity" : "local",
        results: results.map(
          (p: {
            _id: string;
            title: string;
            description: string;
            slug: string;
            department: string;
          }) => ({
            id: p._id,
            title: p.title,
            description: p.description,
            department: p.department,
            url: `/docs${p.slug ? `/${p.slug}` : ""}`,
          }),
        ),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error(
      "Knowledge search failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      {
        error:
          "Search is unavailable. Check the Sanity token and run npm run sanity:status. If embeddings are still updating, try Keyword search.",
      },
      { status: 503 },
    );
  }
}
