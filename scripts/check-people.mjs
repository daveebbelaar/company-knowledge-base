// Opt-in paid check: node --env-file=.env scripts/check-people.mjs
import assert from "node:assert/strict";
import { cookieName, makeSession } from "../lib/access.mjs";
import { readLines } from "../lib/chat.mjs";
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const headers = {
  Cookie: `${cookieName}=${makeSession(process.env.SITE_PASSWORD)}`,
  Origin: base,
  "Content-Type": "application/json",
};
for (const [question, name, profile, page] of [
  [
    "Who should I ask about using a customer logo in a case study?",
    "Noah Ellis",
    "noah-ellis",
  ],
  [
    "Who handles custom customer payment terms?",
    "Daniel Brooks",
    "daniel-brooks",
  ],
  [
    "Who should I ask about product roadmap priorities?",
    "Priya Shah",
    "priya-shah",
  ],
  [
    "What does this person look after?",
    "Noah Ellis",
    "noah-ellis",
    "/docs/team/noah-ellis",
  ],
]) {
  const response = await fetch(base + "/api/chat", {
    method: "POST",
    headers,
    body: JSON.stringify({
      messages: [{ role: "user", content: question }],
      page,
    }),
  });
  assert.equal(response.status, 200);
  let answer = "",
    sources = [],
    done = false;
  for await (const line of readLines(response.body)) {
    if (!line) continue;
    const e = JSON.parse(line);
    assert.notEqual(e.type, "error", e.message);
    if (e.type === "delta") answer += e.text;
    if (e.type === "sources") sources = e.sources;
    if (e.type === "done") done = true;
  }
  console.log(
    JSON.stringify({ question, answer, sources: sources.map((s) => s.url) }),
  );
  assert.ok(done);
  assert.ok(answer.includes(name));
  assert.ok(sources.some((s) => s.url === `/docs/team/${profile}`));
  assert.ok(
    answer.includes(`/docs/team/${profile}`),
    "Missing profile citation",
  );
}
console.log("People questions and profile-page context passed.");
