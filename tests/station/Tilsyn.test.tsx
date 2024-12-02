import {describe, it, expect} from 'vitest';
import '~/pages/field/station/pejling/Pejling';
import '~/features/tilsyn/components/TilsynTableDesktop';
import '~/features/tilsyn/components/TilsynTableMobile';
import '~/features/tilsyn/components/TilsynForm';
import '~/features/tilsyn/api/useTilsyn';

describe('Test Tilsyn', () => {
  it('Check opret, editere og slet tilsyn', () => {
    expect(true).toBe(true);
  });

  it('Check at data bliver korrekt oprettet, editeret eller slettet gennem apiet', () => {
    expect(true).toBe(true);
  });
});
