# Recording guide

## Twenty-minute route

| Time | Show | Point to make |
| --- | --- | --- |
| 0:00–1:00 | A quick look at the finished homepage and a policy | Introduce the internal handbook and disclose the Sanity collaboration. Recommend following along with Claude Code, Codex, or Grok. |
| 1:00–3:30 | Try Fumadocs guide, plain starter at localhost:3002/docs | Show what Fumadocs supplies. Change one sentence in content/docs/index.mdx. Skip the installation wait. |
| 3:30–5:00 | Complete repository, local mode, homepage and owner profile | Switch folders to the finished example at localhost:3000. Viewers clone it and reverse engineer it with their assistant. |
| 5:00–8:00 | Project structure guide, AGENTS.md, homepage, Markdown, CSS | Give a short file-tree tour, then trace a department to a policy and its owner. Explain the MDX starter versus the plain Markdown example. Keep the detailed file reference in the guide for viewers to explore afterward. |
| 8:00–12:00 | Sanity account, import, hosted Studio, agent draft | Show how colleagues maintain content without a website redeployment. Publish a policy edit, then briefly show a prepared agent draft in the same editor. Keep hosting and MCP setup commands in the guide. |
| 12:00–15:30 | Dataset Embeddings, GROQ, search overlay | Compare exact words and intent, including one question about who to contact. |
| 15:30–19:00 | OpenAI chat, a follow-up, and source links | Sanity retrieves content; OpenAI writes the answer. Chat history stays in browser storage. |
| 19:00–20:00 | Password boundary, deployment notes, repo | Explain the shared-gate ceiling and invite viewers to adapt the project. |

Keep Sanity and OpenAI account setup and initial embedding generation as short cuts. The full instructions live in the companion guide. Skip live installation logs, every policy page, advanced permission design, live MCP setup, and a separate vector database.

## Content-mode rehearsal

Use one `main` branch. For the initial walkthrough, start from `.env.example`, set a password, and leave Sanity and OpenAI keys blank. The complete homepage, 18 pages, and 10 people should appear with keyword search. The chat panel is present but answers require the later OpenAI setup.

Say that adding a token does not switch the website. Keep `CONTENT_SOURCE=local` while setting up and importing into the viewer's own Sanity project. Show the document counts, change the setting to `sanity`, restart, and open the same policy URL. A Studio edit proves that the source changed while the layout stayed the same.

Restore practice edits before import to keep the later EUR 45 examples consistent. Explain that import preserves existing documents, and switching back to local does not download Studio edits. Sanity errors do not trigger a hidden fallback.

## Plain starter rehearsal

Follow the companion page at `/docs/company-knowledge-base/fumadocs-starter`. Use a separate `fumadocs-playground` folder with the official Next.js and Fumadocs MDX template, running on port 3002. Keep the full handbook on port 3000. Prepare both before recording so dependency downloads do not consume the walkthrough.

Show the default homepage, open `/docs`, and edit a sentence in `content/docs/index.mdx`. Then switch to the complete repository for all remaining edits. Avoid turning the warm-up into a second build-along project.

## Sanity explanation

Briefly explain that viewers can learn on the free Growth trial. Paid Growth is currently $15 per billable Sanity collaborator per month, with included usage quotas; website readers and fictional employee profiles are not paid seats. Semantic search is on all plans, but this demo uses the trial for private datasets. Mention that trial expiry can make those datasets public on automatic downgrade to Free. Check the linked pricing and trial terms again before recording.

Say that Sanity stores the actual content, including each policy's complete Markdown body and each person's responsibilities. The import creates 18 `knowledgePage` documents and 10 `employee` documents, with policy owners linked by references.

Studio is the editor, Content Lake stores the documents, and Dataset Embeddings supports search by meaning. The Next.js/Fumadocs website reads published content. The homepage design and copy, department definitions, CSS, avatar files, and chat history are not managed in Sanity in this demo.

Colleagues can sign in to the hosted Studio and maintain their own policies. API tokens let an authorized agent update the same Content Lake documents. Human editors use individual accounts; automation uses dedicated tokens. A page owner reference does not enforce department permissions.

The main reason to move beyond Markdown in Git is that routine content updates no longer need a code deployment. An agent can prepare a draft through Sanity MCP, a colleague can review it in Studio, and publishing makes it available to the handbook. Studio schema and website design changes still require deployment. The handbook chat itself has no write access.

Sanity maintains the embeddings for the content, so the demo does not need a separate vector database or synchronization job. The page reflects a published edit on refresh; semantic results can take longer to update.

## Search sequence

1. Search `SEV-1` in Keyword mode. Open Incident response.
2. Search `My work computer disappeared on the train` in Keyword mode. In the verified demo, general pages outrank the lost-device policy.
3. Switch to Semantic. Lost or stolen device is first.
4. Switch to Hybrid. The relevant policy appears near the top; another page can rank first. Explain the weight instead of claiming hybrid always wins.
5. Search `Who signs off on a cheaper quote?`. Keyword can overvalue “off” and show Time off. Semantic and Hybrid surface Discount approvals.
6. Try a question the handbook cannot answer. Explain why retrieval results are candidates, not a guarantee that a policy exists.

These checks were run on 12 September 2026. Rehearse again before recording; Sanity-managed models and ranking may change.

## Chat sequence

Add `OPENAI_API_KEY` before recording and keep `.env` off screen. Show `.env.example` instead. The default is `gpt-5.6-luna` with reasoning disabled for low latency and reliable source links.

1. Click the owner beside a policy title to show their profile and responsibilities. Open the team directory, then return to the policy.
2. Open Ask the handbook and ask `What can I claim for meals after visiting a customer?`.
3. Follow up with `How long do I have to submit the claim?`. Show that it finds the travel policy again using the conversation.
4. Open the source link and verify EUR 45 per day and the 14-day deadline. Expand Pages searched to show the retrieval query and candidates.
5. Refresh and reopen the chat to show saved history. Explain that storage is local to this browser, while questions and retrieved content go to OpenAI.

Try `Who should I ask about using a customer logo?` to connect semantic retrieval with Noah Ellis’s profile. Keep this to one short example.

In code, show `search_knowledge` in `lib/chat.mjs` and the two Responses calls in `app/api/chat/route.ts`. Sanity handles retrieval; OpenAI writes the answer. Do not promise that citations make every generated claim correct.

## Small Studio edit

Open Travel expenses. Change the meal allowance in the body, publish, and refresh that page. Search for the trip question and open the source page again. Restore the amount to EUR 45 afterward. Explain that the page update is immediate on refresh while embeddings update asynchronously.

## Sponsor accuracy

Use Content Lake, Sanity Studio, Dataset Embeddings, and GROQ. Introduce Sanity as a content platform or AI Content Operating System in narration. Describe the Markdown text field honestly; the demo has structured metadata but does not implement Portable Text.

The handbook website runs locally behind a shared password. Studio is hosted at https://vellumridge-handbook.sanity.studio/ and edits the existing private dataset. Viewers deploy their own Studio. The demo keeps the editor small, and all app queries and page reads switch together when CONTENT_SOURCE changes.

The repository is https://github.com/daveebbelaar/company-knowledge-base and remains private during preparation. Make it public before inviting viewers to clone it. Before publication, add the final video URL and timestamps and sponsor tracking link to the companion materials. The video URL and campaign link were not supplied. Sanity's supplied brief asks for product-claim/script review before filming; preserve that production step outside this code build.

## Name check

Quick web searches for the exact phrase “Vellumridge Technology” and for “Vellumridge” plus “company” on 12 September 2026 found no matching engineering or technology company. This is a demo name check, not trademark clearance. All people and business policies in the repository are invented.

## Source references

- [Dataset Embeddings](https://www.sanity.io/docs/content-lake/dataset-embeddings)
- [Search with GROQ](https://www.sanity.io/docs/content-lake/search-content-with-groq)
- [Sanity authentication and tokens](https://www.sanity.io/docs/content-lake/http-auth)
- [Fumadocs search UI](https://www.fumadocs.dev/docs/ui/search)
- [Fumadocs documentation](https://www.fumadocs.dev/docs/ui)

- [Sanity Context](https://www.sanity.io/docs/ai/sanity-context)
- [OpenAI function calling](https://developers.openai.com/api/docs/guides/function-calling)
- [GPT-5.6 Luna](https://developers.openai.com/api/docs/models/gpt-5.6-luna)
