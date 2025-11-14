import React from 'react';

type Props = {
  id: string;
  text: string;
  category?: string;
  onChangeText?: (text: string) => void;
  onChangeCategory?: (cat: string) => void;
  onDelete?: () => void;
};

const CATEGORY_OPTIONS = ['contact', 'experience', 'education', 'skill', 'other'];

export default function RegionEditor({
  id,
  text,
  category,
  onChangeText,
  onChangeCategory,
  onDelete,
}: Props): React.ReactElement {
  return (
    <div
      data-testid={`region-editor-${id}`}
      style={{ border: '1px solid #e5e7eb', padding: 8, borderRadius: 6 }}
    >
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600 }}>Text</label>
        <textarea
          value={text}
          onChange={e => onChangeText?.(e.target.value)}
          style={{ width: '100%', minHeight: 80 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label style={{ fontSize: 12 }}>Category</label>
        <select value={category} onChange={e => onChangeCategory?.(e.target.value)}>
          {CATEGORY_OPTIONS.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button
          onClick={() => onDelete?.()}
          style={{
            marginLeft: 'auto',
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            padding: '6px 10px',
            borderRadius: 4,
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
