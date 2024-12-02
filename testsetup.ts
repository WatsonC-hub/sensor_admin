import '@testing-library/jest-dom/vitest';

import {cleanup} from '@testing-library/react';
import jsdom from 'jsdom';
import L from 'leaflet';
import {LocateControl} from 'leaflet.locatecontrol';
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css';
import {afterEach, vi} from 'vitest';

const {window} = new jsdom.JSDOM(`...`);
window.URL.createObjectURL = vi.fn();
global.URL.createObjectURL = vi.fn();

vi.mock('leaflet.locatecontrol', () => {
  L.control.locate = function (options) {
    if (options) return new LocateControl(options);
    return new LocateControl({});
  };
  return {};
});

// runs a clean after each test case (e.g. clearing jsdom)
afterEach(() => {
  window.URL.createObjectURL = vi.fn();
  cleanup();
});
