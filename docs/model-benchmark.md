# Handbook chat model benchmark

Measured on 12 September 2026 using this repository's OpenAI key and hosted Sanity dataset. GPT-4.1 nano had the lowest median latency. GPT-5.4 mini with reasoning disabled is the better default for this demo: it took about 0.21 seconds longer to finish and passed all citation checks.

## Results

Twelve measured turns per configuration, covering six scenarios twice. Six additional warm-up turns are excluded. Every measured turn made one OpenAI tool-planning request, one live Sanity semantic search, and one streamed OpenAI answer request.

| Model / reasoning | First answer text, median | Complete answer, median | Complete answer, p90 | Fact/link checks passed |
| --- | ---: | ---: | ---: | ---: |
| gpt-4.1-nano | 1.46 s | 1.84 s | 2.23 s | 10/12 |
| gpt-5.4-mini / none | 1.53 s | 2.05 s | 3.13 s | 12/12 |
| gpt-5.6-luna / none | 2.10 s | 2.56 s | 3.50 s | 12/12 |
| gpt-4.1-mini | 1.93 s | 2.65 s | 3.75 s | 11/12 |
| gpt-5.4-nano / none | 1.95 s | 3.05 s | 3.69 s | 12/12 |
| gpt-5.6-luna / low | 2.56 s | 3.18 s | 3.95 s | 12/12 |

First answer text includes planning and retrieval; it does not mean the first byte of the initial API response. All six configurations completed every request without an API error. Latencies include answers that failed a citation check, so speed and answer checks remain separate.

GPT-4.1 nano and GPT-5.4 mini were only about 66 milliseconds apart on median first answer text. That is too small to treat as a dependable perceptual difference in this sample. Luna with no reasoning was slower than both. Low reasoning added about 0.62 seconds to Luna's median completion time without improving these checks.

The [official Luna documentation](https://developers.openai.com/api/docs/models/gpt-5.6-luna) supports both `none` and `low`, with `medium` as the default. The benchmark explicitly sets the tested effort on both OpenAI calls. GPT-4.1 models receive no reasoning parameter.

## Answer checks and manual review

The cases cover meal allowances, a follow-up about the claim deadline, 15% discount approval, a missing work computer, temporary work from Lisbon, and an undocumented paid-volunteer benefit. Follow-ups use the same fixed history for every model.

Each turn checks the expected policy fact, retrieval of the expected page, a citation to that page, and whether every generated link matches a supplied source URL. The unsupported-benefit question instead checks that the answer acknowledges the missing policy. These narrow checks are not a general accuracy score.

- GPT-4.1 nano correctly named the Head of Sales in both discount answers but invented an external source URL in one and omitted a citation in the other. The app filters out unapproved URLs, leaving the first answer without a usable inline source.
- GPT-4.1 mini linked to a page that had not been retrieved in one answer. Manual review also found an unsupported suggestion that the 20-day remote-work limit could be exceeded with approval in round two. That extra claim was not caught by the narrow automated fact check.
- GPT-5.4 nano passed the automated checks, but one answer called Lisbon a country before later naming Portugal. Its longer answers also contributed to total latency.
- Both Luna settings and GPT-5.4 mini passed all 12 automated checks. I reviewed the saved answers against the supplied policy text; this small demo set does not establish reliability on other questions.

## Where the time went

| Model / reasoning | Tool planning, median | Sanity retrieval, median | Answer call, median | Answer output tokens, median |
| --- | ---: | ---: | ---: | ---: |
| gpt-4.1-nano | 0.74 s | 0.07 s | 0.94 s | 60 |
| gpt-5.4-mini / none | 0.83 s | 0.08 s | 1.11 s | 65 |
| gpt-5.6-luna / none | 1.29 s | 0.11 s | 1.26 s | 63.5 |
| gpt-4.1-mini | 1.20 s | 0.11 s | 1.43 s | 86 |
| gpt-5.4-nano / none | 1.15 s | 0.07 s | 1.80 s | 80.5 |
| gpt-5.6-luna / low | 1.21 s | 0.12 s | 1.83 s | 108 |

The answer call includes its own time to first text and generation. Stage medians do not add up to the total median. Output tokens include reasoning tokens where enabled. Most latency came from the two OpenAI calls; median Sanity retrieval ranged from roughly 67 to 119 milliseconds.

## Method and limits

Requests ran sequentially with a deterministic interleaved order across models and scenarios, on the standard `default` service tier. Fast/Priority mode was not tested. Each configuration had one warm-up turn before measurement. There were 78 total turns, or 156 OpenAI requests, including warm-ups.

The script mirrors the production prompts, tool schema, 1,000-token planning cap, 2,200-token answer cap, five retrieved pages, and `store: false`. It omits current-page context, browser rendering, and Next.js request handling. The report therefore measures the chat workflow from the local script, not browser paint time. Network and provider load still affect the measurements.

Output length was allowed to vary as it does in the app. Prompt caching remained automatic, and cache and reasoning token counts are recorded in the raw data. The small repeated set can benefit from warm connections or cached prefixes; this is not a cold-start or load benchmark. Twelve trials per configuration are enough for a practical demo comparison, not a claim about the fastest OpenAI model under every workload.

The tested route SHA-256 was `de4d66e686e87f1da695a10a26bd57b968266c8a1a53d795b6baa9e2404acc14`. Raw results include resolved model snapshots, per-stage timings, token usage, queries, answers, and the source passages used for review.

## Run again

```bash
# Uses paid OpenAI calls and the configured Sanity dataset.
node --env-file=.env scripts/benchmark-chat.mjs
```

The script writes `docs/local-model-benchmark.json`, which stays out of Git. `BENCHMARK_ROUNDS` controls repetitions of the six scenarios and defaults to two. Update the expected facts if you change the fictional policies.

The current demo uses `gpt-5.6-luna` with `reasoning.effort: none`, selected by Dave after reviewing the comparison. These timings were recorded before employee profiles were added. Based on this benchmark alone, GPT-5.4 mini remains the fastest configuration that passed every fact/link check.
