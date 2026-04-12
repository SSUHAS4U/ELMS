# Execution Scripts

This folder contains **deterministic Python scripts** that do the actual work.

Each script should:
- Be self-contained and importable
- Read configuration from environment variables (`.env`)
- Accept clear inputs (CLI args, stdin, or function params)
- Return clear outputs (stdout, files in `.tmp/`, or cloud writes)
- Be well-commented so the orchestration layer (the LLM) can understand what it does

## Naming Convention

Use lowercase, underscore-separated names that match the action:

```
scrape_single_site.py
generate_slides.py
upload_to_sheets.py
```

## Dependencies

If a script needs external packages, add them to `requirements.txt` in the project root.
