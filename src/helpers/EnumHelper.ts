export const StationPages = {
  PEJLING: null,
  TILSYN: 'tilsyn',
  STAMDATA: 'stamdata',
  BILLEDER: 'billeder',
  MAALEPUNKT: 'maalepunkt',
} as const;

export enum TableTypes {
  STATIONTABLE = 'stationTable',
  TABLE = 'table',
  LIST = 'list',
}
