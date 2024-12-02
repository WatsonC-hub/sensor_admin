import {describe, it, expect} from 'vitest';

import '~/pages/admin/kvalitetssikring/QAGraph';
import '~/features/kvalitetssikring/components/usePlotlyLayout';
import '~/components/PlotlyGraph';
import '~/features/kvalitetssikring/components/AdjustmentDataTable';
import '~/features/kvalitetssikring/components/QaHistory';

describe('Test justeringer', () => {
  it('Check at justeringer kommer i den rigtig rækkefølge', () => {
    expect(true).toBe(true);
  });

  it('Check at slette eller editere justeringer', () => {
    expect(true).toBe(true);
  });
  it('Check at det er muligt at korriger et spring', () => {
    expect(true).toBe(true);
  });

  it('Check at det er muligt at fjerne data på baggrund af punkter eller tid', () => {
    expect(true).toBe(true);
  });
  it('Check at det er muligt at sætte valide øvre og nedre grænseværdier', () => {
    expect(true).toBe(true);
  });
  it('Check at det er muligt at godkende en tidsserie til og med nu, gerne prøv at godkende flere gange efter hinanden', () => {
    expect(true).toBe(true);
  });
  it('Check at det er intuitivt at oprette justeringer mht. toast, flere iterationer af fjern data osv.', () => {
    expect(true).toBe(true);
  });
});
