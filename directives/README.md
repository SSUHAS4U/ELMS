# Directives

This folder contains **Standard Operating Procedures (SOPs)** written in Markdown.

Each directive defines:
- **Goal** — What the task accomplishes
- **Inputs** — What data / context is needed
- **Tools / Scripts** — Which `execution/` scripts to call, in what order
- **Outputs** — What the deliverable looks like
- **Edge Cases & Learnings** — Gotchas discovered over time (updated by the self-annealing loop)

## Naming Convention

Use lowercase, hyphen-separated names that describe the workflow:

```
scrape-website.md
generate-report.md
sync-crm-data.md
```

## Rules

1. Directives are **living documents** — update them when you learn something new.
2. Never delete a directive without asking the user first.
3. Keep instructions concrete enough that a mid-level employee (or an LLM) could follow them.
