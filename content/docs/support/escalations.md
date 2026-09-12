---
title: "Customer escalations"
description: "Give Engineering enough context to investigate and keep the customer informed."
owner: "Leo Martins"
updated: "2026-09-12"
order: 2
---

Escalate when an account is blocked without a safe workaround, the same failure appears across customers, or there is a possible security issue.

## Include these details

Capture the expected behavior, observed behavior, earliest occurrence, affected account IDs, and steps to reproduce. Add sanitized logs and the current application version. Link the customer ticket so updates stay connected.

Page the on-call engineer for an active outage or suspected data exposure. Use the engineering support queue for a reproducible bug that can wait until business hours.

## Ownership

Support owns the customer conversation. Engineering owns investigation and recovery. Tell the customer when the next update will arrive, even when the fix is still unknown.

Do not ask the customer to repeat information that is already in the ticket. Confirm recovery with them before closing the conversation.

For broad impact, the [incident lead](/docs/engineering/incident-response) coordinates the technical response.
