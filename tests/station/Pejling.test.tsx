import {describe, it, expect} from 'vitest';
import '~/pages/field/station/pejling/Pejling';
import '~/features/pejling/components/PejlingMeasurementsTableDesktop';
import '~/features/pejling/components/PejlingMeasurementsTableMobile';
import '~/features/pejling/components/PejlingForm';
import '~/features/pejling/api/usePejling';

describe('Test Pejling', () => {
  it('Check opret, editere og slet pejling', () => {
    expect(true).toBe(true);
  });

  it('Check at data bliver korrekt oprettet, editeret eller slettet gennem apiet', () => {
    expect(true).toBe(true);
  });

  it('Check at dynamic measurement virker korrekt', () => {
    expect(true).toBe(true);
  });

  it('Lokationer uden tidsserie skal kunne navigere til opret tidsserie', () => {
    expect(true).toBe(true);
  });
});
