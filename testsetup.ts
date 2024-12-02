import '@testing-library/jest-dom/vitest';
import {cleanup} from '@testing-library/react';
import jsdom from 'jsdom';
import {afterEach, vi} from 'vitest';

const {window} = new jsdom.JSDOM(`...`);
window.URL.createObjectURL = vi.fn();
global.URL.createObjectURL = vi.fn();

// runs a clean after each test case (e.g. clearing jsdom)
afterEach(() => {
  window.URL.createObjectURL = vi.fn();
  cleanup();
});
