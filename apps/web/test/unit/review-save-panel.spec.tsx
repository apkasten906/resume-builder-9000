import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ReviewSavePanel from '../../src/components/ReviewSavePanel';

describe('ReviewSavePanel', () => {
  it('opens consent and posts regions on accept', async () => {
    const initialRegions = [
      { id: 'r1', page: 1, bbox: [0, 0, 10, 10], text: 'Alice', category: 'contact' },
    ];

    const onSaved = vi.fn();

    // mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: async () => ({ ok: true, savedId: 123 }) } as any)
    ) as any;

    const { getByTestId, queryByTestId } = render(
      <ReviewSavePanel
        initialRegions={initialRegions as any}
        pageWidth={600}
        pageHeight={800}
        onSaved={onSaved}
      />
    );

    // open consent
    fireEvent.click(getByTestId('open-consent'));
    expect(getByTestId('consent-notice')).toBeTruthy();

    // accept
    fireEvent.click(getByTestId('consent-accept'));

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(123));

    // consent should be gone
    await waitFor(() => expect(queryByTestId('consent-notice')).toBeNull());
  });
});
