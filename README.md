# Pathways IRL Tool

KTH Innovation Readiness Level assessment tool for the Pathways Pre-Accelerator, University of Helsinki.

## Stack

- React + Vite
- Supabase (PostgreSQL)
- GitHub Pages (hosting)

## Local development

```bash
npm install
npm run dev
```

## Deploy

Push to `main` — GitHub Actions builds and deploys automatically to GitHub Pages.

## Configuration

Supabase credentials are in `src/supabaseClient.js`.

## Data

All submissions are stored in the `irl_submissions` table in Supabase.
Data controller: University of Helsinki.
Framework: KTH Innovation Readiness Level™ © KTH Innovation, CC BY-NC-SA 4.0.
