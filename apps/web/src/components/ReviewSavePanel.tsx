import React, { useState } from 'react';
import ResumePreviewOverlay, { ParsedRegion } from './ResumePreviewOverlay';
import RegionEditor from './RegionEditor';
import AddRegionForm from './AddRegionForm';
import ConsentNotice from './ConsentNotice';
import { saveReviewedRegions } from '../services/resume-service';

type Props = {
  initialRegions: ParsedRegion[];
  pageWidth: number;
  pageHeight: number;
  onSaved?: (savedId: number) => void;
};

export default function ReviewSavePanel({
  initialRegions,
  pageWidth,
  pageHeight,
  onSaved,
}: Props): React.ReactElement {
  const [regions, setRegions] = useState<ParsedRegion[]>(initialRegions);
  const [showConsent, setShowConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateRegion(id: string, patch: Partial<ParsedRegion>): void {
    setRegions(r => r.map(x => (x.id === id ? { ...x, ...patch } : x)));
  }

  function deleteRegion(id: string): void {
    setRegions(r => r.filter(x => x.id !== id));
  }

  function addRegion(text: string, category: string): void {
    const id = `r-${Date.now()}`;
    setRegions(r => [...r, { id, page: 1, bbox: [0, 0, 100, 20], text, category } as ParsedRegion]);
  }

  async function onAcceptConsent(): Promise<void> {
    setShowConsent(false);
    setLoading(true);
    setError(null);
    try {
      const resp = await saveReviewedRegions({ regions, consent: true });
      setLoading(false);
      if (resp?.ok) {
        onSaved?.(resp.savedId ?? 0);
      } else {
        setError('Save failed');
      }
    } catch (err_) {
      setLoading(false);
      const message = err_ instanceof Error ? err_.message : String(err_);
      setError(message);
    }
  }

  return (
    <div>
      <div style={{ height: 480, border: '1px solid #e5e7eb', marginBottom: 12 }}>
        <ResumePreviewOverlay
          pageWidth={pageWidth}
          pageHeight={pageHeight}
          regions={regions}
          onSelect={() => {}}
        />
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {regions.map(r => (
          <RegionEditor
            key={r.id}
            id={r.id}
            text={r.text}
            category={r.category}
            onChangeText={t => updateRegion(r.id, { text: t })}
            onChangeCategory={c => updateRegion(r.id, { category: c })}
            onDelete={() => deleteRegion(r.id)}
          />
        ))}

        <AddRegionForm onAdd={addRegion} />

        {error && (
          <div data-testid="save-error" style={{ color: 'red' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', marginTop: 8 }}>
          <button
            onClick={() => setShowConsent(true)}
            data-testid="open-consent"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Reviewed Regions'}
          </button>
        </div>

        {showConsent && (
          <ConsentNotice onAccept={onAcceptConsent} onCancel={() => setShowConsent(false)} />
        )}
      </div>
    </div>
  );
}
