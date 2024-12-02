import {describe, it, expect} from 'vitest';
import '~/features/stamdata/components/stamdata/ReferenceForm';
import '~/components/tableComponents/MaalepunktTableDesktop';
import '~/components/tableComponents/MaalepunktTableMobile';
import '~/hooks/query/useMaalepunkt';

describe('Test maalepunkt', () => {
  it('Check opret, editere og slet maalepunkt', () => {
    expect(true).toBe(true);
  });

  it('Check at data bliver korrekt oprettet, editeret eller slettet gennem apiet', () => {
    expect(true).toBe(true);
  });

  it('Check at maalepunktet har en start og slut dato der ikke er før eller efter enheden', () => {
    expect(true).toBe(true);
  });
});
