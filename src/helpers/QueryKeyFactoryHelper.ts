export const queryKeys = {
  Pejling: {
    all: (ts_id: number) => ['measurements', ts_id] as const,
  },
  Tilsyn: {
    all: (ts_id: number) => ['tilsyn', ts_id] as const,
  },
  Metadata: {
    timeseries: (ts_id: number | undefined) => ['metadata', ts_id] as const,
    location: (loc_id: number | undefined) => ['location_data', loc_id] as const,
  },
  Timeseries: {
    all: (loc_id: number) => ['timeseries', loc_id] as const,
  },
  LocationInfo: {
    all: (loc_id: number | undefined) => ['location_info', loc_id] as const,
  },
  Map: {
    all: () => ['map'] as const,
  },
  Tasks: {
    all: () => ['tasks'] as const,
  },
  Udstyr: {
    all: (ts_id: number) => ['udstyr', ts_id] as const,
  },
};

export const PejlingInvalidation = (ts_id: number, loc_id: number) => {
  return [
    queryKeys.Pejling.all(ts_id),
    queryKeys.Timeseries.all(loc_id),
    queryKeys.Tasks.all(),
    queryKeys.Map.all(),
  ];
};

export const TilsynInvalidation = (ts_id: number, loc_id: number) => {
  return [
    queryKeys.Tilsyn.all(ts_id),
    queryKeys.Timeseries.all(loc_id),
    queryKeys.Tasks.all(),
    queryKeys.Map.all(),
  ];
};
export const MetadataInvalidation = (ts_id: number, loc_id: number) => {
  return [
    queryKeys.Metadata.timeseries(ts_id),
    queryKeys.Timeseries.all(loc_id),
    queryKeys.LocationInfo.all(loc_id),
  ];
};
