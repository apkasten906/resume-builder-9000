import { render, screen } from '@testing-library/react';
import React from 'react';
import BuildPageImpl from '../../../tests/unit/BuildPageImpl';
import * as mockData from '../../../tests/unit/__mocks__/mockBuildPageData';
import '@testing-library/jest-dom/vitest';
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
// (file removed - test files should not be in src/app/build)
