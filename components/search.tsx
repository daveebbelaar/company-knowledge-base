"use client";
import { useEffect, useState } from "react";
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogListItem,
  SearchDialogOverlay,
  type SharedProps,
} from "fumadocs-ui/components/dialog/search";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { ArrowUpRight, Search } from "lucide-react";

const examples = [
  "What can I claim after visiting a customer?",
  "A customer wants their data to stay in Europe",
  "My work computer disappeared on the train",
];
type Result = {
  id: string;
  title: string;
  description: string;
  department: string;
  url: string;
};

export function SearchButton({ large = false }: { large?: boolean }) {
  const { setOpenSearch } = useSearchContext();
  return (
    <button
      onClick={() => setOpenSearch(true)}
      className={large ? "hero-search" : "search-button"}
    >
      <Search size={19} aria-hidden />
      <span>
        {large ? "Ask a question. Find the right page." : "Search knowledge"}
      </span>
      <kbd>⌘ K</kbd>
    </button>
  );
}

export function KnowledgeSearch(props: SharedProps) {
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("hybrid");
  const [source, setSource] = useState("local");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!props.open) return;
    const controller = new AbortController();
    setResults([]);
    setError("");
    setLoading(search.trim().length >= 2);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?query=${encodeURIComponent(search)}&mode=${mode}`,
          { signal: controller.signal },
        );
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Search failed. Try again.");
        setResults(data.results);
        setSource(data.source);
      } catch (error) {
        if (!controller.signal.aborted)
          setError(error instanceof Error ? error.message : "Search failed.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, mode, props.open]);

  return (
    <SearchDialog
      {...props}
      search={search}
      onSearchChange={setSearch}
      isLoading={loading}
    >
      <SearchDialogOverlay />
      <SearchDialogContent className="knowledge-search">
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput
            placeholder="What do you need to know?"
            maxLength={240}
          />
          <SearchDialogClose />
        </SearchDialogHeader>
        <div className="search-toolbar">
          {source === "sanity" ? (
            <div className="mode-switch" aria-label="Search mode">
              {["keyword", "semantic", "hybrid"].map((value) => (
                <button
                  key={value}
                  aria-pressed={mode === value}
                  onClick={() => setMode(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          ) : (
            <span>Local keyword search</span>
          )}
          <span>
            {source === "sanity" ? "Search by Sanity" : "Markdown pages"}
          </span>
        </div>
        {error ? (
          <p role="alert" className="search-message">
            {error}
          </p>
        ) : search.trim().length < 2 ? (
          <div className="search-suggestions">
            <p>TRY A QUESTION</p>
            {examples.map((query) => (
              <button key={query} onClick={() => setSearch(query)}>
                {query}
                <ArrowUpRight size={16} />
              </button>
            ))}
          </div>
        ) : (
          <SearchDialogList
            items={results.map((result) => ({
              id: result.id,
              type: "page" as const,
              url: result.url,
              content: result.title,
            }))}
            Empty={() => (
              <p className="search-message" role="status">
                {loading
                  ? "Searching the knowledge base…"
                  : "No matching pages. Try a shorter question or another search mode."}
              </p>
            )}
            Item={({ item, onClick }) => {
              const result = results.find((r) => r.id === item.id)!;
              return (
                <SearchDialogListItem
                  item={item}
                  onClick={onClick}
                  className="search-result"
                >
                  <span className="eyebrow">{result.department}</span>
                  <strong>{result.title}</strong>
                  <span>{result.description}</span>
                </SearchDialogListItem>
              );
            }}
          />
        )}
        <div className="search-bottom">
          {source === "sanity"
            ? "Find source pages by exact words or meaning."
            : "Connect Sanity to search by meaning."}
          <span>
            ↑ ↓ navigate <span className="ml-3">↵ open</span>
          </span>
        </div>
      </SearchDialogContent>
    </SearchDialog>
  );
}
