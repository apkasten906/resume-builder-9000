# Resume Builder 9000 - Development Guidelines

This project is a resume orchestration engine that creates tailored, ATS-friendly resumes.

## Project Structure

- Monorepo with workspaces
- Frontend: Next.js (App Router), Tailwind CSS, shadcn/ui components
- Backend: Node.js with Express, SQLite for database
- Packages:
  - `@rb9k/core`: Shared business logic (TypeScript)
  - `@rb9k/api`: Backend API (Express)
  - `@rb9k/web`: Frontend application (Next.js)

## Development Guidelines

- Follow TypeScript best practices with strict typing
- Maintain clean code using ESLint rules
- Write tests for all new functionality using Vitest
- Follow the branch protection rules for PRs

## PowerShell Scripting Rules

- ALWAYS use PowerShell for dev environment scripting and Copilot chat automation.
- NEVER use special characters (icons) when creating PowerShell scripts. Use plain text only for messages and output.

## Setup Instructions

- Run `setup.ps1` to install dependencies and build the project
- Use `dev.ps1` for the development environment:
  - `-Fresh`: For a clean install
  - `-WithLLM`: To enable external LLM integration
  - `-ApiOnly`/`-WebOnly`: To run specific parts of the application

## Feature Development

- Keep ATS-friendliness as a priority for resume generation
- Ensure responsive design for all UI components
- Follow accessibility best practices

## Further Instructions

- See the files in the copilot folder for more specific instructions on how to contribute to this project.
