# Resume Builder 9000

Welcome to the Resume Builder 9000! This project is designed to help you create tailored, ATS-friendly resumes with ease.

## Features

- Frontend: Next.js with Tailwind CSS
- Backend: Node.js with Express and SQLite
- Shared business logic in TypeScript
- Secure authentication with JWT tokens and HTTP-only cookies
- ATS-optimized resume generation

## Getting Started

Run the following commands to set up the project:

1. Install dependencies:

   ```bash
   npm install
   ```

2. **API always runs on port 4000.** Ensure your `.env` or `.env.local` file contains:

   ```env
   # API Configuration
   API_BASE=4000
   NEXT_PUBLIC_API_BASE=http://localhost:4000
   JWT_SECRET=your-secret-key-here
   ```

   > **Note:** The frontend expects the API to be available at `http://localhost:4000` via the `NEXT_PUBLIC_API_BASE` environment variable. Update this in all environments as needed. The JWT_SECRET is used for secure authentication.

3. Start the development server (for local development):

   ```bash
   npm run dev
   ```

   > **Note:** You do not need to build before running the dev server. The dev server handles hot reloading and TypeScript transpilation automatically.

4. Build the project (for production):

   ```bash
   npm run build
   ```

   > **Note:** Only run this step if you are preparing for production deployment. In production, you would typically run the built output with a separate command (e.g., `npm start`).

5. Run tests:

   ```bash
   npm test
   ```

6. Default test user (for development):

   ```text
   Email: user@example.com
   Password: ValidPassword1!
   ```

## Running the Environment

### Local Setup

To run the environment locally without Docker, use the following script:

#### Windows

```powershell
./dev.ps1
```

### Persisting test secret (optional)

The development script can generate a secure `TEST_ROUTE_SECRET` used to protect test-only endpoints (for example `/__test/emails`). By default the script sets the secret for the current session only. If you want the generated secret to be persisted into your local `.env` file (not committed), run the script with the `-PersistTestSecret` flag:

```powershell
./dev.ps1 -PersistTestSecret
```

Notes:

- The script will only write the `TEST_ROUTE_SECRET` into `.env` if `.env` exists in the repository root. Do NOT commit `.env`.
- For CI/E2E runs, set `ENABLE_TEST_ROUTES=true` and add `TEST_ROUTE_SECRET` to your CI secret store (for GitHub Actions: Repository → Settings → Secrets → Actions).

#### Linux/Mac

```bash
bash ./dev.sh
```

> **Note:** For speed, it is recommended to use the local setup during development.

## Testing

### Unit Tests

We use **Vitest** for unit testing. To run the unit tests:

```bash
npm run test:unit
```

### Integration/E2E Tests

We use **Playwright** for integration and E2E testing. To run these tests:

```bash
npm run test:e2e
```

> **Important**: Always use the npm script `test:e2e` instead of running Playwright directly with `npx playwright test`.
> Our project includes warning systems that remind you about this practice to ensure consistent test configuration and environment setup.
> For Playwright CLI access, use `npm run playwright -- <command>` instead of `npx playwright <command>`.
> See [Playwright Testing Guidelines](./docs/testing/playwright-guidelines.md) for more information.

You can also use our dedicated script for running Playwright tests with more options:

**Windows PowerShell:**

```powershell
# Run tests with standard logging
./scripts/run-playwright-tests.ps1

# Run tests with verbose logging
./scripts/run-playwright-tests.ps1 -Verbose

# Run specific test file with HTML reporter
./scripts/run-playwright-tests.ps1 -TestFile "standalone-login.spec.ts" -Reporter

# Run in headed mode (shows browser)
./scripts/run-playwright-tests.ps1 -Headed
```

**Linux/Mac Bash:**

```bash
# Run tests with standard logging
bash ./scripts/run-playwright-tests.sh

# Run tests with verbose logging
bash ./scripts/run-playwright-tests.sh --verbose

# Run specific test file with HTML reporter
bash ./scripts/run-playwright-tests.sh --test-file "standalone-login.spec.ts" --reporter

# Run in headed mode (shows browser)
bash ./scripts/run-playwright-tests.sh --headed
```

### Combined Testing Script

To run both Vitest and Playwright tests sequentially:

```bash
npm run test:all
```

### Testing Architecture

For a detailed explanation of our testing strategies, boundaries, and tools, see the [Testing Architecture documentation](./docs/Architecture/testing-architecture.md).

## Contributing

Feel free to submit issues and pull requests. We welcome contributions from the community!

## Resources

- Check out [awesome-github-copilot](https://github.com/awesome-github-copilot/awesome-github-copilot) for tips and resources on using GitHub Copilot effectively.

## License

This project is licensed under the MIT License.

## Dev tasks (VS Code)

We provide two convenient VS Code tasks (in `.vscode/tasks.json`) to start the development environment. Use the VS Code Command Palette → "Tasks: Run Task" to pick one.

### Run Dev Script (session secret)

Uses: `./scripts/run-e2e-with-temp-secret.ps1`

Behavior: Generates a secure, in-session `TEST_ROUTE_SECRET`, starts `dev.ps1` with the repository as the working directory, and leaves the secret in-memory only (safer for local runs).

When to use: Quick dev runs and one-off E2E tests where you don't want to persist secrets to disk.

### Run Dev Script (direct)

Uses: `./dev.ps1 -PersistTestSecret`

Behavior: Runs the main `dev.ps1` script and (optionally) persists the generated `TEST_ROUTE_SECRET` to `.env` when `-PersistTestSecret` is passed.

When to use: Repeated local sessions where you want the secret persisted across terminal sessions. Do NOT commit the `.env` file.

### Security note

- The `TEST_ROUTE_SECRET` exists to protect test-only endpoints. Only enable `ENABLE_TEST_ROUTES=true` and set `TEST_ROUTE_SECRET` in CI/CD environments using secure secrets storage (GitHub Actions Secrets, Vault, etc.).
- Never commit `.env` that contains sensitive secrets. The tasks and scripts will warn you when they persist a secret.
