# Feature specs

Write one file per feature, named `docs/features/<feature-name>.md`. Write it **before** you build the feature, and update it **after** you merge, so it describes what actually shipped.

Keep each spec short. It records intent and boundaries, and the code is the source of truth for the details. Use the words from `CONTEXT.md`. If the feature introduces a new domain term, add the term there.

## Template

```md
# <Feature name>

Status: idea | specced | in progress | shipped (<date>)
Branch/PR: <link>

## Goal
What problem this solves and for whom, in 1–3 sentences.

## User flows
1. The user does X, and the app shows Y.
2. ...

## Rules and edge cases
- What happens when ... (offline? no permission? empty data?)

## Data / API
- Endpoints read or written, new query keys, and any change to the backend contract.

## Out of scope
- What we deliberately did not do, so nobody "adds it back" by accident.

## Notes after shipping
- What changed from the plan, and why.
```
