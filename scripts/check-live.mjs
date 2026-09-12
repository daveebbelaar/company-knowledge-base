import assert from "node:assert/strict";

const base = process.env.TEST_BASE_URL || "http://localhost:3000";
for (const path of ["/", "/docs/operations/travel-expenses"]) {
  const response = await fetch(base + path, { redirect: "manual" });
  assert.equal(response.status, 307, `${path} must require a password`);
}
assert.equal((await fetch(base + "/api/search?query=travel")).status, 401);
assert.equal(
  (await fetch(base + "/api/unlock", { method: "POST" })).status,
  403,
);
const rejected = await fetch(base + "/api/unlock", {
  method: "POST",
  redirect: "manual",
  headers: { Origin: base },
  body: new URLSearchParams({ password: "deliberately-incorrect-password" }),
});
assert.equal(rejected.headers.get("set-cookie"), null);
const login = await fetch(base + "/api/unlock", {
  method: "POST",
  redirect: "manual",
  headers: { Origin: base },
  body: new URLSearchParams({ password: process.env.SITE_PASSWORD }),
});
assert.equal(login.status, 303);
const cookieHeader = login.headers.get("set-cookie");
assert.ok(cookieHeader?.includes("HttpOnly"));
const headers = { Cookie: cookieHeader.split(";")[0] };
const page = await fetch(base + "/docs/operations/travel-expenses", {
  headers,
});
assert.equal(page.status, 200);
assert.match(await page.text(), /EUR 45/);
assert.equal(
  (await fetch(base + "/api/search?query=travel&mode=invalid", { headers }))
    .status,
  400,
);
const queries =
  process.env.CONTENT_SOURCE === "sanity"
    ? [
        ["My work computer disappeared on the train", "Lost or stolen device"],
        ["Who signs off on a cheaper quote?", "Discount approvals"],
      ]
    : [["travel expenses", "Travel expenses"]];
for (const [query, title] of queries) {
  const response = await fetch(
    base + "/api/search?mode=semantic&query=" + encodeURIComponent(query),
    { headers },
  );
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.ok(
    data.results.slice(0, 3).some((result) => result.title === title),
    `Expected ${title} in top three`,
  );
}
console.log(
  "Live checks passed: password boundary, login, page rendering, input validation, and retrieval.",
);
