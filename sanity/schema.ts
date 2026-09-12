import { defineField, defineType } from "sanity";

export const knowledgePage = defineType({
  name: "knowledgePage",
  title: "Knowledge page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "Summary",
      type: "text",
      rows: 2,
      validation: (r) => r.required().max(240),
    }),
    defineField({
      name: "slug",
      title: "Page path",
      type: "string",
      description:
        "For example operations/travel-expenses. Leave empty only for the handbook introduction. Keep published paths stable.",
      validation: (r) =>
        r.custom((value) =>
          value === "" ||
          (typeof value === "string" && /^[a-z0-9-]+\/[a-z0-9-]+$/.test(value))
            ? true
            : "Use department/page-name, or an empty string for the introduction.",
        ),
    }),
    defineField({
      name: "department",
      type: "string",
      options: {
        list: [
          { title: "Company", value: "company" },
          { title: "Engineering", value: "engineering" },
          { title: "Marketing", value: "marketing" },
          { title: "Sales", value: "sales" },
          { title: "Support", value: "support" },
          { title: "Operations", value: "operations" },
          { title: "People & HR", value: "people" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "owner",
      title: "Owner name (Markdown fallback)",
      type: "string",
      hidden: ({ document }) => Boolean(document?.ownerProfile),
      validation: (r) => r.custom((value, context) =>
        value || context.document?.ownerProfile ? true : "Choose an owner profile or enter a fallback name.",
      ),
    }),
    defineField({
      name: "ownerProfile",
      title: "Owner profile",
      type: "reference",
      to: [{ type: "employee" }],
      description:
        "Links the page to a person. Their current name is shown on the website; the text owner field supports the Markdown starter.",
    }),
    defineField({
      name: "updated",
      title: "Last reviewed",
      type: "date",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "order",
      title: "Sidebar order",
      type: "number",
      initialValue: 10,
    }),
    defineField({
      name: "body",
      title: "Page content (Markdown)",
      type: "text",
      rows: 24,
      description:
        "Use ## headings, bullet lists and [links](/docs/department/page). Plain Markdown keeps this demo small and portable.",
      validation: (r) => r.required(),
    }),
  ],
  orderings: [
    {
      title: "Department and order",
      name: "departmentOrder",
      by: [
        { field: "department", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
  preview: { select: { title: "title", subtitle: "department" } },
});

export const employee = defineType({
  name: "employee",
  title: "Employee",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "role",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Profile path",
      type: "string",
      description:
        "A stable ID such as noah-ellis. Keep published paths stable. It also selects the matching local avatar.",
      validation: (r) => r.required().regex(/^[a-z0-9-]+$/),
    }),
    defineField({
      name: "department",
      type: "string",
      options: {
        list: [
          "engineering",
          "marketing",
          "sales",
          "support",
          "operations",
          "people",
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "bio",
      title: "Short bio",
      type: "text",
      rows: 3,
      validation: (r) => r.required().max(500),
    }),
    defineField({
      name: "responsibilities",
      title: "Ask me about",
      type: "array",
      of: [{ type: "string" }],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "updated",
      title: "Last reviewed",
      type: "date",
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: "name", subtitle: "role" } },
});
