# resume-builder-9000

A resume orchestration engine that compiles a fully tailored, ATS-friendly resume (and optional cover letter) for a specific job posting.

## Inputs:

- You Personal Information
- Your Work Experience
- - Responsibilities - What were you expected to do?
  - Results - What did you accomplish? Did you go beyond your role?
  - Role Relevance - What roles do each of your Responsibitities / Results relate to? How relevant to each role are they?
- Job To Apply For
- - Link to the job you are applying for OR
  - A general Role you would like to apply for OR
  - Your Dream Job?

## Output:

- A printable resume tailored for the job you specify with a unique URL that can be downloaded as PDF

# Technology Stack

## Frontend

- Next.js (App Router)
- Tailwind CSS
- shadcn/ui components

## Backend

- Node.js with Express
- SQLite for database (MVP)

## Architecture

- Monorepo structure with workspaces
- Packages:
  - `@rb9k/core`: Shared business logic (TypeScript)
  - `@rb9k/api`: Backend API (Express)
  - `@rb9k/web`: Frontend application (Next.js)
