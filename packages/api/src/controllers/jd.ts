// packages/api/src/controllers/jd.ts
import { Request, Response } from 'express';

export async function parseJD(req: Request, res: Response): Promise<Response> {
  const { text } = req.body || {};
  if (!text || typeof text !== 'string') return res.status(400).json({ error: 'text required' });
  const first = text.split('\n')[0] || '';
  // Allow multi-word titles, use only [a-z] and 'i' flag for case insensitivity
  const titleRegex =
    /(?:(Senior|Lead|Principal)\s+)?([a-z]+(?: [a-z]+)*Developer|Engineer|Manager)/i;
  const titleMatch = titleRegex.exec(first);
  const title = titleMatch ? titleMatch[0] : 'Unknown Role';
  // Allow multi-word company names, but avoid space in character class to satisfy SonarQube
  const companyRegex = /at\s+([a-z][a-z0-9&]*(?: [a-z0-9&]+)*)/i;
  const companyMatch = companyRegex.exec(text);
  const company = companyMatch ? companyMatch[1] : 'Unknown Company';
  const requirements = text
    .split(/[\n•-]/)
    .filter((s: string) => /experience|years|typescript|react|node|next/i.test(s))
    .slice(0, 8)
    .map((s: string) => s.trim());
  const keywordRegex = /typescript|react|next\.js|node|aws|sql|css|html|docker|kubernetes|graphql/g;
  const keywords = Array.from(
    new Set(
      requirements.flatMap((s: string) => {
        const found = [] as string[];
        let match;
        const lower = s.toLowerCase();
        while ((match = keywordRegex.exec(lower)) !== null) {
          found.push(match[0]);
        }
        keywordRegex.lastIndex = 0; // Reset regex state for global regex
        return found;
      })
    )
  );
  return res.json({ title, company, location: '—', requirements, keywords });
}
