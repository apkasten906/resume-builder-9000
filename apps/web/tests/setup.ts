// Import testing libraries
import '@testing-library/jest-dom';
import { expect } from 'vitest';
import * as jestDomMatchers from '@testing-library/jest-dom/matchers';

// Configure Vitest to use jest-dom matchers
expect.extend(jestDomMatchers.default || jestDomMatchers);
