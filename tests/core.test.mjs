import test from "node:test";
import assert from "node:assert/strict";
import { makeSession, validSession, sessionSeconds } from "../lib/access.mjs";
import { readLocalEmployees, employeePage } from "../lib/employees.mjs";
import { access } from "node:fs/promises";
import { readLocalPages } from "../lib/local-content.mjs";
import { searchQuery } from "../lib/sanity.mjs";

test("the shared gate rejects tampering, expired sessions, and password rotation", () => {
  const now = Date.now();
  const session = makeSession("test-password", now);
  assert.equal(validSession(session, "test-password", now), true);
  assert.equal(validSession(session + "x", "test-password", now), false);
  assert.equal(validSession(session, "changed-password", now), false);
  assert.equal(
    validSession(session, "test-password", now + sessionSeconds * 1000 + 1),
    false,
  );
  for (const value of ["", "123", "garbage.signature", undefined])
    assert.equal(validSession(value, "test-password"), false);
});

test("all starter pages have distinct paths and working internal links", async () => {
  const pages = await readLocalPages();
  const paths = new Set(pages.map((p) => `/docs${p.slug ? `/${p.slug}` : ""}`));
  assert.equal(paths.size, pages.length);
  assert.equal(new Set(pages.map((p) => p._id)).size, pages.length);
  assert.equal(
    new Set(pages.filter((p) => p.slug).map((p) => p.department)).size,
    6,
  );
  paths.add("/docs/team");
  for (const person of await readLocalEmployees())
    paths.add(`/docs/team/${person.slug}`);
  for (const page of pages) {
    assert.ok(page.body.length > 80);
    for (const link of page.body.matchAll(/\]\((\/docs[^)#]*)(?:#[^)]*)?\)/g))
      assert.ok(paths.has(link[1]), `${page.slug}: broken link ${link[1]}`);
  }
});

test("search keeps input parameterized and excludes drafts", () => {
  assert.match(searchQuery(), /text::semanticSimilarity\(\$searchText\)/);
  assert.match(searchQuery(), /text::query\(\$searchText\)/);
  assert.match(searchQuery(), /drafts/);
  assert.doesNotMatch(searchQuery("keyword"), /semanticSimilarity/);
  assert.doesNotMatch(searchQuery("semantic"), /text::query/);
});

test("employee profiles cover every page owner and have searchable responsibilities and local avatars", async () => {
  const people = await readLocalEmployees();
  assert.equal(people.length, 10);
  assert.equal(new Set(people.map((p) => p._id)).size, 10);
  assert.equal(new Set(people.map((p) => p.slug)).size, 10);
  for (const page of await readLocalPages())
    assert.ok(
      people.some((p) => p.name === page.owner),
      `Missing owner: ${page.owner}`,
    );
  for (const person of people) {
    const page = employeePage(person);
    assert.equal(page.slug, `team/${person.slug}`);
    assert.ok(page.body.includes(person.role));
    assert.ok(
      person.responsibilities.every((item) => page.body.includes(item)),
    );
    await access(`public/avatars/${person.slug}.svg`);
  }
  assert.match(searchQuery(), /employee/);
  assert.match(searchQuery(), /responsibilities/);
});
