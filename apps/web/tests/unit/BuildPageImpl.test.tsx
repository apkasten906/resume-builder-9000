import { render, screen } from '@testing-library/react';
import React from 'react';
import BuildPageImpl from './BuildPageImpl.js';
import * as mockData from './__mocks__/mockBuildPageData';
import { describe, test, expect, vi, afterEach } from 'vitest';

describe('BuildPageImpl', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('renders with mock requirements and skills (injected)', () => {
    render(
      <BuildPageImpl
        parsedRequirements={mockData.mockParsedRequirements}
        parsedSkills={mockData.mockParsedSkills}
      />
    );
    expect(screen.getByTestId('parsed-requirements')).toHaveTextContent(
      mockData.mockParsedRequirements.join(', ')
    );
    expect(screen.getByTestId('parsed-skills')).toHaveTextContent(
      mockData.mockParsedSkills.join(', ')
    );
  });
});
