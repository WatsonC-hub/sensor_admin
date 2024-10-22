export const StationPages = {
  PEJLING: null,
  TILSYN: 'tilsyn',
  STAMDATA: 'stamdata',
  BILLEDER: 'billeder',
  MAALEPUNKT: 'maalepunkt',
  DEFAULT: null,
} as const;

export const QaPages = {
  DATA: null,
  ALGORITHMS: 'algoritmer',
  DATAMOBILE: 'Justeringer',
};

export const QaAdjustment = {
  CONFIRM: 'confirm',
  REMOVE: 'remove',
  BOUNDS: 'bounds',
  CORRECTION: 'correction',
};

export enum TableTypes {
  STATIONTABLE = 'stationTable',
  TABLE = 'table',
  LIST = 'list',
}

export enum MergeType {
  RECURSIVEMERGE = 'merge',
  SHALLOWMERGE = 'assign',
}

export enum CategoryType {
  Udstyr = 0,
  Sikkerhed = 1,
  Hygiejne = 2,
  Certifikat = 3,
  Standard = 4,
}

export enum AccessType {
  Key = 'Nøgle',
  Code = 'Kode',
}

export enum ContactInfoRole {
  DataEjer = 'Data Ejer',
  kontakter = 'Adgangskontakt',
}

export enum ContactInfoType {
  Lokation = 'lokation',
  Projekt = 'projekt',
}

export enum QaStampLevel {
  A = '1',
  B = '2',
  C = '3',
}
