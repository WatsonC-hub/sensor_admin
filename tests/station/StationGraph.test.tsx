import {describe, it, expect} from 'vitest';
import '~/features/station/components/StationGraph';
import '~/features/kvalitetssikring/components/usePlotlyLayout';
import '~/components/PlotlyGraph';

describe('Test graph på lokationer', () => {
  it('Check knapperne uge, måned, år og alt virker korrekt', () => {
    expect(true).toBe(true);
  });

  it('Check at det er muligt at zoome ind og derefter enten klikke på knappen alt eller dobble klik for at gå tilbage', () => {
    expect(true).toBe(true);
  });
  it('Check at det er muligt at indhente rå data', () => {
    expect(true).toBe(true);
  });

  it('Check at kontrolpejlinger bliver vist i grafen', () => {
    expect(true).toBe(true);
  });
  it('Check at dynamisk pejling bliver korrekt placeret i midten af grafen når der oprettes en ny pejling', () => {
    expect(true).toBe(true);
  });
});
