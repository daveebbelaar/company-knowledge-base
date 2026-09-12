import { existsSync } from "node:fs";
import path from "node:path";
import type { Employee } from "@/lib/people";

export function EmployeeAvatar({
  person,
  size = 56,
}: {
  person: Pick<Employee, "name" | "slug">;
  size?: number;
}) {
  const hasAvatar =
    /^[a-z0-9-]+$/.test(person.slug) &&
    existsSync(
      path.join(process.cwd(), "public/avatars", `${person.slug}.svg`),
    );
  return (
    <span
      className="employee-avatar"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {hasAvatar ? (
        <img
          src={`/avatars/${person.slug}.svg`}
          alt=""
          width={size}
          height={size}
        />
      ) : (
        person.name
          .split(" ")
          .map((word) => word[0])
          .slice(0, 2)
          .join("")
      )}
    </span>
  );
}
