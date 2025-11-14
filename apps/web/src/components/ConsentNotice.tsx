import React from 'react';

type Props = {
  onAccept: () => void;
  onCancel: () => void;
};

export default function ConsentNotice({ onAccept, onCancel }: Props): React.ReactElement {
  return (
    <div
      data-testid="consent-notice"
      style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff7ed' }}
    >
      <p style={{ margin: 0, marginBottom: 8 }}>
        By saving, you confirm that parsed data (including contact info) may be stored in your
        profile draft. You can cancel to discard.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onCancel} style={{ padding: '6px 10px' }} data-testid="consent-cancel">
          Cancel
        </button>
        <button
          onClick={onAccept}
          style={{
            marginLeft: 'auto',
            background: '#0ea5a4',
            color: '#fff',
            border: 'none',
            padding: '6px 10px',
            borderRadius: 4,
          }}
          data-testid="consent-accept"
        >
          Save
        </button>
      </div>
    </div>
  );
}
