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
    byItinerary: (itinerary_id: string | null) => ['tasks', itinerary_id] as const,
  },
  Udstyr: {
    all: (ts_id: number) => ['udstyr', ts_id] as const,
  },
  Maalepunkt: {
    all: (ts_id: number) => ['watlevmp', ts_id] as const,
  },
  Algorithms: {
    all: (ts_id: number) => ['algorithms', ts_id] as const,
  },
  CertifyQa: {
    all: (ts_id: number) => ['certifyQa', ts_id] as const,
  },
  QA: {
    all: (ts_id: number) => ['qa_all', ts_id] as const,
  },
  Parking: {
    all: () => ['parking'] as const,
  },
  Routes: {
    all: () => ['leaflet_map_route'] as const,
  },
  contacts: {
    all: (loc_id: number) => ['contact_info', loc_id] as const,
    search: (search: string) => ['search_contact_info', search] as const,
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
