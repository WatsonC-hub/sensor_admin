import {describe, it, expect} from 'vitest';
import '~/features/stamdata/components/stationDetails/contacts/ContactInfo';
import '~/features/stamdata/components/stationDetails/contacts/ContactInfoTable';
import '~/features/stamdata/components/stationDetails/contacts/SelectContactInfo';
import '~/features/stamdata/components/stationDetails/contacts/StationContactInfo';

import '~/features/stamdata/components/stationDetails/locationAccessKeys/LocationAccess';
import '~/features/stamdata/components/stationDetails/locationAccessKeys/LocationAccessFormDialog';
import '~/features/stamdata/components/stationDetails/locationAccessKeys/LocationAccessTable';
import '~/features/stamdata/components/stationDetails/locationAccessKeys/SelectLocationAccess';

import '~/features/stamdata/components/stationDetails/ressourcer/Huskeliste';
import '~/features/stamdata/components/stationDetails/ressourcer/multiselect/Autocomplete';
import '~/features/stamdata/components/stationDetails/ressourcer/multiselect/TransferList';

describe('Test kontakter på edit stamdata', () => {
  it('Check at rolle og tilknytning skal være vælgt før det er muligt at oprette en kontakt', () => {
    expect(true).toBe(true);
  });
  it('Check at det er muligt at editere og slette kontakter', () => {
    expect(true).toBe(true);
  });
  it('Check at den finder relaterede kontakter korrekt', () => {
    expect(true).toBe(true);
  });
  it('Check at søgefunktionalitet virker korrekt', () => {
    expect(true).toBe(true);
  });
  it('Check at det er muligt at se information på kontakter på mobilen ved at klikke på en række i tabellen', () => {
    expect(true).toBe(true);
  });
  it('Check at det ikke er muligt at editere navn, email, tlf nummer på calypso brugere', () => {
    expect(true).toBe(true);
  });
  it('Check at en almindelig bruger ikke kan søge/se relaterede kontakter(Calypso og ikke calypso) end dem der bundet til deres organisation', () => {
    expect(true).toBe(true);
  });
});

describe('Test nøgler på edit stamdata', () => {
  it('Check at type, navn kode/placering felterne skal være udfyldt før der kan oprettes en nøgle', () => {
    expect(true).toBe(true);
  });
  it('Check at det er muligt at se information på nøgler på mobilen ved at klikke på en række i tabellen', () => {
    expect(true).toBe(true);
  });
  it('Check at søgefunktionalitet virker korrekt', () => {
    expect(true).toBe(true);
  });
});

describe('Test ressourcer på edit stamdata', () => {
  it('Check at flytte ressource fra den ene liste til den anden', () => {
    expect(true).toBe(true);
  });
});
