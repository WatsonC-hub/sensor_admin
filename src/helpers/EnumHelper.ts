export const StationPages = {
  PEJLING: null,
  TILSYN: 'tilsyn',
  STAMDATA: 'stamdata',
  BILLEDER: 'billeder',
  MAALEPUNKT: 'maalepunkt',
  DEFAULT: null,
} as const;

export enum TableTypes {
  STATIONTABLE = 'stationTable',
  TABLE = 'table',
  LIST = 'list',
}
