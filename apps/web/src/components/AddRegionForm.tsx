import React, { useState } from 'react';

type Props = {
  onAdd: (text: string, category: string) => void;
};

const CATEGORY_OPTIONS = ['contact', 'experience', 'education', 'skill', 'other'];

export default function AddRegionForm({ onAdd }: Props): React.ReactElement {
  const [text, setText] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onAdd(text, category);
        setText('');
      }}
      data-testid="add-region-form"
    >
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', fontSize: 12 }}>Text</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          style={{ width: '100%', minHeight: 60 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label style={{ fontSize: 12 }}>Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORY_OPTIONS.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          type="submit"
          style={{
            marginLeft: 'auto',
            background: '#10b981',
            color: '#fff',
            border: 'none',
            padding: '6px 10px',
            borderRadius: 4,
          }}
        >
          Add
        </button>
      </div>
    </form>
  );
}
