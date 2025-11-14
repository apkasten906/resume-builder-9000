// Quick script to check what text is extracted from the test PDF
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfPath = path.join(
  __dirname,
  'apps/web/tests/assets/Resume_BrianFaker_SoftwareDeveloper_English_v1.pdf'
);

async function main() {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdf(dataBuffer);

  console.log('=== EXTRACTED TEXT ===');
  console.log(data.text);
  console.log('\n=== LINES ===');
  const lines = data.text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l);
  lines.forEach((line, i) => {
    console.log(`Line ${i}: ${line}`);
  });

  console.log('\n=== CHECKING FOR KEYWORDS ===');
  const lowerText = data.text.toLowerCase();
  console.log('Contains "summary":', lowerText.includes('summary'));
  console.log('Contains "experience":', lowerText.includes('experience'));
  console.log('Contains "skills":', lowerText.includes('skills'));
}

main().catch(console.error);
