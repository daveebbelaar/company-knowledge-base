---
title: "Incident response"
description: "What to do when Fieldbook stops working for customers."
owner: "Maya Chen"
updated: "2026-09-12"
order: 2
---

A widespread outage, suspected data exposure, or inability to submit service records is **SEV-1**. A broken feature with a usable workaround is **SEV-2**.

## First fifteen minutes

Open an incident in #incidents and page the on-call engineer. Assign an incident lead to coordinate and a communications owner to update Support. Record when the problem started, affected customers, and the last known good deployment.

Contain the impact before investigating the perfect root cause. Disable a failing feature or roll back a release when that is the fastest safe recovery.

## Keep people informed

For SEV-1, publish an initial status update within 15 minutes and another every 30 minutes. State what is affected and when the next update will arrive. Do not promise a recovery time without evidence.

Support follows the [customer escalation process](/docs/support/escalations). Only the incident lead closes the incident after recovery checks pass.

## Learn from it

Write a short review within two working days. Include the timeline, customer impact, what restored service, and one owner for each follow-up.
