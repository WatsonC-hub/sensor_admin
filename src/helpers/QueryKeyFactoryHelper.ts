export const queryKeys = {
  Location: {
    info: (loc_id: number) => ['location_info', loc_id] as const,
    metadata: (loc_id: number | undefined) => ['location_metadata', loc_id] as const,
    timeseries: (loc_id: number | undefined) => ['timeseries', loc_id] as const,
    contacts: (loc_id: number) => ['contact_info', loc_id] as const,
    searchContacts: (search: string) => ['search_contact_info', search] as const,
    keys: (loc_id: number) => ['location_access', loc_id] as const,
    searchKeys: (search: string) => ['search_location_access', search] as const,
    ressources: () => ['ressourcer'] as const,
    locationRessources: (loc_id: number) => ['ressourcer', loc_id] as const,
    permissions: (loc_id: number | undefined) => ['location_permissions', loc_id] as const,
  },
  Timeseries: {
    metadata: (ts_id: number | undefined) => ['metadata', ts_id] as const,
    // timeseries: (ts_id: number) => ['timeseries', ts_id] as const,
    pejling: (ts_id: number) => ['measurements', ts_id] as const,
    tilsyn: (ts_id: number) => ['service', ts_id] as const,
    maalepunkt: (ts_id: number) => ['watlevmp', ts_id] as const,
    availableUnits: (ts_id: number) => ['udstyr', ts_id] as const,
    unitHistory: (ts_id: number | undefined) => ['udstyr', ts_id] as const,
    algorithms: (ts_id: number) => ['algorithms', ts_id] as const,
    certifyQa: (ts_id: number) => ['certifyQa', ts_id] as const,
    QA: (ts_id: number) => ['qa_all', ts_id] as const,
    latestMeasurement: (ts_id: number) => ['latest_measurement', ts_id] as const,
    batteryStatus: (ts_id: number | undefined) => ['battery_status', ts_id] as const,
  },
  Borehole: {
    boreholeSearch: (boreholeno: string | undefined | null) =>
      ['search_borehole', boreholeno] as const,
  },
  Map: {
    all: () => ['map'] as const,
  },
  Tasks: {
    all: () => ['tasks'] as const,
    byItinerary: (itinerary_id: string | null) => ['tasks', itinerary_id] as const,
  },
  Parking: {
    all: () => ['parking'] as const,
  },
  Routes: {
    all: () => ['leaflet_map_route'] as const,
  },
  BoreholePermissions: {
    all: () => ['borehole_permissions'] as const,
  },
  AvailableUnits: {
    all: () => ['available_units'] as const,
  },
  LocationProjects: {
    all: () => ['location_projects'] as const,
  },
  Groups: {
    all: () => ['location_groups'] as const,
  },
  contactRoles: () => ['contact_roles'] as const,
  images: (loc_id_or_boreholeno: number | string) => ['images', loc_id_or_boreholeno] as const,
};

export const PejlingInvalidation = (ts_id: number, loc_id: number) => {
  return [
    queryKeys.Timeseries.pejling(ts_id),
    queryKeys.Location.timeseries(loc_id),
    queryKeys.Tasks.all(),
    queryKeys.Map.all(),
  ];
};

export const TilsynInvalidation = (ts_id: number, loc_id: number) => {
  return [
    queryKeys.Timeseries.tilsyn(ts_id),
    queryKeys.Location.timeseries(loc_id),
    queryKeys.Tasks.all(),
    queryKeys.Map.all(),
  ];
};
