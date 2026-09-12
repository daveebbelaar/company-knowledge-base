"use client";
import { RootProvider } from "fumadocs-ui/provider/next";
import { KnowledgeSearch } from "./search";
import { KnowledgeChat } from "./chat";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RootProvider
      theme={{ defaultTheme: "light" }}
      search={{ SearchDialog: KnowledgeSearch }}
    >
      {children}
      <KnowledgeChat />
    </RootProvider>
  );
}
