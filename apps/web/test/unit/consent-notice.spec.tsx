import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import ConsentNotice from '../../src/components/ConsentNotice';

describe('ConsentNotice', () => {
  it('calls onAccept and onCancel correctly', async () => {
    const onAccept = vi.fn();
    const onCancel = vi.fn();
    const { getByTestId } = render(<ConsentNotice onAccept={onAccept} onCancel={onCancel} />);

    fireEvent.click(getByTestId('consent-cancel'));
    fireEvent.click(getByTestId('consent-accept'));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onAccept).toHaveBeenCalledTimes(1);
  });
});
