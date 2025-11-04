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

Follow accessibility best practices

## Issue-Based Workflow Steps

- For each new feature or UI spec issue, create a dedicated branch (e.g., `feature/<issue-name>`).
- Before implementation, comment out any Playwright or other tests that cannot yet pass for the feature.
- Work on the feature in its branch, enabling tests only when the UI or logic is ready.
- Repeat this process for each issue to ensure isolated, test-driven development and clean PRs.
- As you implement each step, commit your changes with clear messages describing what was implemented and any decisions made.
- Document key decisions and implementation notes in the PR or issue as you progress.
- When starting work on a new issue, set the status of the Issue to In Progress in the tracker/project board.
- If any new cases are discovered that require testing, add a new acceptance criterion (AC) in Gherkin syntax to the story/issue.

## PowerShell Scripting Rules

- NEVER use special characters (icons) when creating PowerShell scripts. Use plain text only for messages and output.

## Setup Instructions

- Run `setup.ps1` to install dependencies and build the project
- Run Task `Run Dev Script` to start the development environment in it's own terminal window:
  - This starts both the API and Web servers with hot reload enabled
  - Set environment variables in `.env` files as needed
  - The dev script uses `concurrently` to run both servers
  - The API server runs on port 4000 and the Web server on port 3000 by default
  - Unit tests are run as a pre-build step for the API server
- Use the following suffixes for different setup configurations:
  - `-Fresh`: For a clean install
  - `-WithLLM`: To enable external LLM integration
  - `-ApiOnly`/`-WebOnly`: To run specific parts of the application

## Playwright E2E Testing

- Run E2E tests using the `test:e2e` npm script to ensure proper environment setup and server availability.
- Always use Playwright with the `dot` reporter (`--reporter=dot`) for automated and autonomous test runs. This ensures the process exits automatically after tests complete, enabling hands-off debugging and CI/CD workflows.

## Feature Development

- Keep ATS-friendliness as a priority for resume generation
- Ensure responsive design for all UI components
- Follow accessibility best practices

## Further Instructions

- After reading these instructions read the files in the `instructions` and `copilot` folders for additional contribution guidelines and instructions.
