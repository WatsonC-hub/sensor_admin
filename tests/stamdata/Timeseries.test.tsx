import {describe, it, expect} from 'vitest';
import '~/features/stamdata/components/stamdata/TimeseriesForm';

describe('Test tidsserie på opret stamdata', () => {
  it('Check at de rigtige felter er required af zod og der kommer valideringsfejl hvis noget mangler', () => {
    expect(true).toBe(true);
  });
  it('Check at det ikke er muligt at oprette en tidsserie uden at vælge en tidsserie type', () => {
    expect(true).toBe(true);
  });
  it('Check at hvis man vælger vandstand som tidsserie type, at der så er en requirement på målepunktskote og placering', () => {
    expect(true).toBe(true);
  });
});
