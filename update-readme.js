import { writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

const readmePath = join(__dirname, 'README.md');
const content = `# Resume Builder 9000

Welcome to the Resume Builder 9000! This project is designed to help you create tailored, ATS-friendly resumes with ease.

## Features
- Frontend: Next.js with Tailwind CSS
- Backend: Node.js with Express and SQLite
- Shared business logic in TypeScript

## Getting Started
Run the following commands to set up the project:

1. Install dependencies:
   npm install

2. Start the development server:
   npm run dev

3. Build the project:
   npm run build

4. Run tests:
   npm test

## Contributing
Feel free to submit issues and pull requests. We welcome contributions from the community!

## License
This project is licensed under the MIT License.`;

writeFileSync(readmePath, content, 'utf8');
console.log('README.md has been updated successfully.');
