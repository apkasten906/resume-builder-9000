# Resume Builder 9000

Welcome to the Resume Builder 9000! This project is designed to help you create tailored, ATS-friendly resumes with ease.

## Features

- Frontend: Next.js with Tailwind CSS
- Backend: Node.js with Express and SQLite
- Shared business logic in TypeScript

## Getting Started

Run the following commands to set up the project:

1. Install dependencies:

   ```bash
   npm install
   ```

2. **API always runs on port 4000.** Ensure your `.env` or `.env.local` file contains:

   ```env
   # API Configuration
   PORT=4000
   NEXT_PUBLIC_API_BASE=http://localhost:4000
   ```

   > **Note:** The frontend expects the API to be available at `http://localhost:4000` via the `NEXT_PUBLIC_API_BASE` environment variable. Update this in all environments as needed.

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

## Running the Environment

### Local Setup

To run the environment locally without Docker, use the following script:

#### Windows

```powershell
./dev.ps1
```

#### Linux/Mac

```bash
bash ./dev.sh
```

### Docker Setup

To run the project using Docker Compose, use the following command:

```bash
docker-compose up
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

### Combined Testing Script

To run both Vitest and Playwright tests sequentially:

#### Windows

```powershell
npm run test:all
```

#### Linux/Mac

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
