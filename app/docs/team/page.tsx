import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DocsPage, DocsTitle, DocsDescription } from "fumadocs-ui/page";
import { EmployeeAvatar } from "@/components/employee-avatar";
import { departments } from "@/lib/company";
import { getEmployees } from "@/lib/people";

export default async function TeamDirectory() {
  const people = await getEmployees();
  return (
    <DocsPage tableOfContent={{ enabled: false }}>
      <DocsTitle>People to know</DocsTitle>
      <DocsDescription>
        Find the right colleague for the question in front of you.
      </DocsDescription>
      <div className="directory-intro">
        <span>
          {people.length} people across {departments.length} departments
        </span>
        <p>
          Each profile explains what they own and when to ask them. You can also
          search the handbook or ask the chat to point you in the right
          direction.
        </p>
      </div>
      <div className="employee-grid">
        {people.map((person) => (
          <Link
            className="employee-card"
            href={`/docs/team/${person.slug}`}
            key={person._id}
          >
            <div className="employee-card-top">
              <EmployeeAvatar person={person} />
              <ArrowUpRight size={17} aria-hidden />
            </div>
            <span className="employee-department">
              {departments.find((d) => d.slug === person.department)?.name ||
                person.department}
            </span>
            <h2>{person.name}</h2>
            <p className="employee-role">{person.role}</p>
            <p className="employee-bio">{person.bio}</p>
            <span className="employee-card-link">
              See responsibilities <ArrowUpRight size={14} aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </DocsPage>
  );
}
