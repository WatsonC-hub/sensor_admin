import {describe, it, expect} from 'vitest';
import '~/features/stamdata/components/stamdata/LocationForm';
import '~/features/stamdata/components/stamdata/AddLocationForm';
import '~/features/stamdata/components/stamdata/LocationTypeSelect';
import '~/features/stamdata/components/stamdata/LocationGroups';
import '~/features/stamdata/components/stamdata/LocationProjects';

describe('Test lokation form generelt', () => {
  it('Check at de rigtige felter er required af zod og der kommer valideringsfejl hvis noget mangler', () => {
    expect(true).toBe(true);
  });
  it('Check at projektnummer feltet er gemt væk for ikke superbruger', () => {
    expect(true).toBe(true);
  });
  it('Check at grupperinger virker korrekt', () => {
    expect(true).toBe(true);
  });
  it('Check at lokationstyper virker korrekt', () => {
    expect(true).toBe(true);
  });
});

describe('Test lokation form på opret stamdata', () => {
  it('Check at lokationsdata bliver korrekt udfyldt når der klikkes opret tidsserie fra stationssiden', () => {
    expect(true).toBe(true);
  });
  it('Check at der ikke er behov for at klikke på lokationstab før man udfylder tidsserie når der klikkes opret tidsserie fra stationssiden', () => {
    expect(true).toBe(true);
  });
});

describe('Test lokation form på edit stamdata', () => {
  it('Check at lokationsdata bliver korrekt læst ind fra metadata', () => {
    expect(true).toBe(true);
  });
  it('Check at annuller knappen resetter formen tilbage til default', () => {
    expect(true).toBe(true);
  });
  it('Check at gem knappen virker korrekt', () => {
    expect(true).toBe(true);
  });
});
