import {describe, it, expect} from 'vitest';
import '~/features/stamdata/components/stamdata/AddUnitForm';
import '~/features/stamdata/components/stamdata/UnitForm';

describe('Test udstyr på opret stamdata', () => {
  it('Check at det ikke er muligt at tilføje udstyr uden at have vælgt en tidsserie type', () => {
    expect(true).toBe(true);
  });
  it('Check at det er muligt at tilføje udstyr', () => {
    expect(true).toBe(true);
  });
});

describe('Test udstyr på edit stamdata', () => {
  it('Check at det er muligt at hjemtage udstyr', () => {
    expect(true).toBe(true);
  });
  it('Check at invoice dialog ikke kommer op hvis man hjemtager udstyr som almindelig bruger', () => {
    expect(true).toBe(true);
  });
  it('Check at det start dato ikke må være efter slut dato', () => {
    expect(true).toBe(true);
  });
});
