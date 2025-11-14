import React from 'react';
import bboxToCssPercent, { BBox } from '../lib/bbox';

export type ParsedRegion = {
  id: string;
  page: number;
  bbox: BBox;
  text: string;
  category?: string;
};

type Props = {
  pageWidth: number;
  pageHeight: number;
  regions: ParsedRegion[];
  onSelect?: (region: ParsedRegion) => void;
};

export default function ResumePreviewOverlay({
  pageWidth,
  pageHeight,
  regions,
  onSelect,
}: Props): React.ReactElement {
  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%' }}
      data-testid="resume-overlay"
    >
      {regions.map(r => {
        const style = bboxToCssPercent(pageWidth, pageHeight, r.bbox);
        return (
          <button
            key={r.id}
            onClick={() => onSelect?.(r)}
            data-testid={`region-${r.id}`}
            style={{
              position: 'absolute',
              left: style.left,
              top: style.top,
              width: style.width,
              height: style.height,
              background: 'rgba(59,130,246,0.18)',
              border: '2px solid rgba(59,130,246,0.6)',
              borderRadius: 4,
              padding: 0,
              textAlign: 'left',
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                display: 'block',
                fontSize: 10,
                color: '#034',
                padding: 4,
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {r.category ?? 'region'}
            </span>
          </button>
        );
      })}
    </div>
  );
}
