import type { ParsedRegion } from '../components/ResumePreviewOverlay';

export type SavePayload = {
  regions: ParsedRegion[];
  consent: boolean;
};

export async function saveReviewedRegions(
  payload: SavePayload
): Promise<{ ok: boolean; savedId?: number }> {
  const res = await fetch('/api/resumes/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Save failed: ${res.status} ${text}`);
  }

  return res.json();
}

export default { saveReviewedRegions };
