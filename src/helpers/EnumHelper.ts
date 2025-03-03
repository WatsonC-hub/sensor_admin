export const stationPages = {
  GENERELTLOKATION: 'generelt lokation',
  GENERELTUDSTYR: 'generelt udstyr',
  GENERELTIDSSERIE: 'generelt tidsserie',
  SENDEINTERVAL: 'sendeinterval',
  PEJLING: 'pejling',
  TILSYN: 'tilsyn',
  KONTAKTER: 'kontakter',
  NØGLER: 'nøgler',
  HUSKELISTE: 'huskeliste',
  BILLEDER: 'billeder',
  MAALEPUNKT: 'målepunkt',
  UDSTYR: 'udstyr',
  ALGORITHMS: 'algoritmer',
  JUSTERINGER: 'justeringer',
} as const satisfies Record<string, string>;

export type StationPages = (typeof stationPages)[keyof typeof stationPages];

export const qaPages = {
  ALGORITHMS: 'algoritmer',
  JUSTERINGER: 'justeringer',
} as const;

export const qaPagesLiteral = ['algoritmer', 'justeringer'] as const;

export const qaAdjustment = {
  CONFIRM: 'confirm',
  REMOVE: 'remove',
  BOUNDS: 'bounds',
  CORRECTION: 'correction',
} as const;

export const qaAdjustmentLiteral = ['confirm', 'remove', 'bounds', 'correction'] as const;

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

export enum AdjustmentTypes {
  EXLUDETIME = 'Fjernet tidsinterval',
  LEVELCORRECTION = 'Korrigeret spring',
  EXLUDEPOINTS = 'Fjernet datapunkter',
  MINMAX = 'Valide værdier',
  APPROVED = 'Godkendt',
}
