// packages/api/src/controllers/tailor.ts
import { Request, Response } from 'express';

export async function tailorBullets(req: Request, res: Response): Promise<Response> {
  const { bullets = [], keywords = [] } = req.body || {};
  const result = bullets.map((text: string, i: number) => {
    const hits = keywords.reduce(
      (acc: number, k: string) => acc + (text.toLowerCase().includes(k.toLowerCase()) ? 1 : 0),
      0
    );
    const score = Math.min(100, 40 + hits * 20 + (i % 5) * 5);
    return { id: `${i + 1}`, text, score };
  });
  return res.json({ items: result });
}
