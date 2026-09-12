---
title: "Release checklist"
description: "The checks between a merged change and a safe production release."
owner: "Maya Chen"
updated: "2026-09-12"
order: 1
---

Small releases go out Tuesday through Thursday, between 10:00 and 15:00 UTC. Avoid Friday releases unless you are fixing an active incident.

## Before shipping

1. Get one engineer outside the change to review the pull request.
2. Run the integration tests and exercise the affected flow in staging.
3. Include a rollback command and the previous image tag in the release note.
4. Check whether Support needs a heads-up about a visible behavior change.

Database changes must work with both the old and the new application version. Remove old columns in a later release after all readers have moved.

## Watch the release

The releasing engineer watches error rate and job completion for 30 minutes. Roll back if failed job submissions exceed 2% for five minutes or sign-in is broken.

For Northstar, test an offline checklist, reconnect the device, and confirm that each completed item syncs exactly once. A successful page load alone does not prove the feature works.

## When something breaks

Pause further releases and follow [incident response](/docs/engineering/incident-response).
