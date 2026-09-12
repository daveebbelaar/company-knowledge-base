import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EmployeeAvatar } from "@/components/employee-avatar";
import { getEmployees } from "@/lib/people";
import { departments } from "@/lib/company";
import { notFound } from "next/navigation";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { getPages } from "@/lib/content";

export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  const [pages, people] = await Promise.all([getPages(), getEmployees()]);
  if (slug[0] === "team" && slug.length === 2) {
    const person = people.find((p) => p.slug === slug[1]);
    if (!person) notFound();
    const owned = pages.filter((p) =>
      p.ownerSlug ? p.ownerSlug === person.slug : p.owner === person.name,
    );
    return (
      <DocsPage tableOfContent={{ enabled: false }} breadcrumb={{ enabled: false }}>
        <Link href="/docs/team" className="profile-back">
          <ArrowLeft size={14} aria-hidden /> Team directory
        </Link>
        <div className="employee-profile-heading">
          <EmployeeAvatar person={person} size={88} />
          <div className="employee-profile-identity">
            <span className="employee-department">
              {departments.find((d) => d.slug === person.department)?.name}
            </span>
            <DocsTitle>{person.name}</DocsTitle>
            <DocsDescription>{person.role}</DocsDescription>
          </div>
        </div>
        <DocsBody>
          <p className="employee-profile-bio">{person.bio}</p>
          <h2>Ask me about</h2>
          <ul>
            {person.responsibilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {owned.length > 0 && (
            <>
              <h2>Pages I look after</h2>
              <div className="profile-pages">
                {owned.map((p) => (
                  <Link href={`/docs${p.slug ? "/" + p.slug : ""}`} key={p._id}>
                    <strong>{p.title}</strong>
                    <span>{p.description}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
          <p className="profile-review">
            Profile reviewed{" "}
            <time dateTime={person.updated}>{person.updated}</time>. Part of our
            fictional demo team.
          </p>
        </DocsBody>
      </DocsPage>
    );
  }
  const page = pages.find((p) => p.slug === slug.join("/"));
  if (!page) notFound();
  const owner = people.find((p) =>
    page.ownerSlug ? p.slug === page.ownerSlug : p.name === page.owner,
  );
  return (
    <DocsPage tableOfContent={{ enabled: false }}>
      <DocsTitle>{page.title}</DocsTitle>
      <DocsDescription>{page.description}</DocsDescription>
      <div className="page-byline">
        <span>
          Owner{" "}
          {owner ? (
            <Link
              className="owner-profile-link"
              href={`/docs/team/${owner.slug}`}
            >
              <EmployeeAvatar person={owner} size={26} />
              <strong>{owner.name}</strong>
            </Link>
          ) : (
            <strong>{page.owner}</strong>
          )}
        </span>
        <span>
          Reviewed <time dateTime={page.updated}>{page.updated}</time>
        </span>
      </div>
      <DocsBody>
        <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
          {page.body}
        </Markdown>
      </DocsBody>
    </DocsPage>
  );
}
