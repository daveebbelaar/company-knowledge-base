import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { House } from "lucide-react";
import Link from "next/link";
import { getSource } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const source = await getSource();
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: (
          <span className="docs-brand">
            <span className="brand-mark" aria-hidden>
              v
            </span>
            Vellumridge
          </span>
        ),
      }}
      sidebar={{
        tabs: false,
        prefetch: false,
        banner: (
          <Link href="/" className="back-home">
            <House size={16} />
            Company home
          </Link>
        ),
      }}
      links={[
        { text: "Company home", url: "/", on: "nav" },
        {
          type: "icon",
          text: "Company home",
          label: "Company home",
          icon: <House />,
          url: "/",
          on: "menu",
        },
      ]}
    >
      {children}
    </DocsLayout>
  );
}
