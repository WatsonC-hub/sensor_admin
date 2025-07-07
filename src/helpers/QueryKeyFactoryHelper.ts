import {Dayjs} from 'dayjs';

export const queryKeys = {
  Location: {
    info: (loc_id: number | undefined) => ['location_info', loc_id] as const,
    metadata: (loc_id: number | undefined) => ['location_metadata', loc_id] as const,
    timeseries: (loc_id: number | undefined) => ['timeseries', loc_id] as const,
    contacts: (loc_id: number) => ['contact_info', loc_id] as const,
    searchContacts: (search: string) => ['search_contact_info', search] as const,
    keys: (loc_id: number) => ['location_access', loc_id] as const,
    searchKeys: (search: string) => ['search_location_access', search] as const,
    ressources: () => ['ressourcer'] as const,
    locationRessources: (loc_id: number) => ['ressourcer', loc_id] as const,
    permissions: (loc_id: number | undefined) => ['location_permissions', loc_id] as const,
    minimalSelectList: (loc_id: number | undefined) => ['tsList', loc_id] as const,
  },
  Timeseries: {
    all: () => ['timeseries'] as const,
    metadata: (ts_id: number | undefined) => ['metadata', ts_id] as const,
    // timeseries: (ts_id: number) => ['timeseries', ts_id] as const,
    allPejling: () => ['measurements'] as const,
    pejling: (ts_id: number) => ['measurements', ts_id] as const,
    tilsyn: (ts_id: number) => ['service', ts_id] as const,
    maalepunkt: (ts_id: number) => ['watlevmp', ts_id] as const,
    availableUnits: (ts_id: number) => ['udstyr', ts_id] as const,
    unitHistory: (ts_id: number | undefined) => ['udstyr', ts_id] as const,
    algorithms: (ts_id: number) => ['algorithms', ts_id] as const,
    certifyQa: (ts_id: number) => ['certifyQa', ts_id] as const,
    QAWithTsId: (ts_id: number) => ['qa_all', ts_id] as const,
    QA: () => ['qa_all'] as const,
    qaLabels: (ts_id: number | undefined) => ['qa_labels', ts_id] as const,
    removedData: (ts_id: number) => ['removed_data', ts_id] as const,
    precipitationData: (ts_id: number) => ['precipitation_data', ts_id] as const,
    linesData: (ts_id: number) => ['lines_data', ts_id] as const,
    rawData: (ts_id: number) => ['rawdata', ts_id] as const,
    latestMeasurement: (ts_id: number) => ['latest_measurement', ts_id] as const,
    batteryStatus: (ts_id: number | undefined) => ['battery_status', ts_id] as const,
    pollData: (ts_id: number | undefined) => ['pollData', ts_id] as const,
    pollQA: (ts_id: number | undefined) => ['pollQA', ts_id] as const,
    edgeDates: (ts_id: number | undefined) => ['all_range', ts_id] as const,
    graphData: (ts_id: number | undefined, xRange: Array<Dayjs>) =>
      ['graphData', ts_id, xRange] as const,
  },
  Borehole: {
    stamdata: (boreholeno: string | undefined | null, intakeno: number | undefined) =>
      ['borehole_stamdata', boreholeno, intakeno] as const,
    allStamdata: () => ['borehole_stamdata'] as const,
    boreholeSearch: (boreholeno: string | undefined | null) =>
      ['search_borehole', boreholeno] as const,
    intakeList: (boreholeno: string | undefined | null) => ['intake_list', boreholeno] as const,
    jupiterData: (boreholeno: string | undefined | null, intakeno: number) =>
      ['jupiter_waterlevel', boreholeno, intakeno] as const,
    measurementsWithIntake: (boreholeno: string | undefined | null, intakeno: number | undefined) =>
      ['measurements', boreholeno, intakeno] as const,
    measurements: (boreholeno: string | undefined | null) => ['measurements', boreholeno] as const,
    watlevmpWithIntake: (boreholeno: string | undefined | null, intakeno: number | undefined) =>
      ['watlevmp', boreholeno, intakeno] as const,
    watlevmp: (boreholeno: string | undefined | null) => ['watlevmp', boreholeno] as const,
    minimalSelect: (boreholeno: string | undefined | null) => ['borehole', boreholeno] as const,
    lastMP: (boreholeno: string | undefined | null, intakeno: number | undefined) =>
      ['last_jupiter_mp', boreholeno, intakeno] as const,
  },
  Map: {
    all: () => ['map'] as const,
  },
  Tasks: {
    all: () => ['tasks'] as const,
    byItinerary: (itinerary_id: string | null) => ['tasks', itinerary_id] as const,
    closedTasks: (loc_id: number | undefined) => ['closed_tasks', loc_id] as const,
    taskHistory: (task_id: string) => ['taskHistory', task_id] as const,
    nextDueDate: (ts_id: number) => ['next_due_date', ts_id] as const,
    taskUsers: () => ['task_users'] as const,
    taskStatus: () => ['task_status'] as const,
  },
  Itineraries: {
    all: () => ['itineraries'] as const,
    byId: (itinerary_id: string | undefined) => ['itineraries', itinerary_id] as const,
    itineraryTasks: (itinerary_id: string | undefined) =>
      ['itineraries_tasks', itinerary_id] as const,
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
  imagesById: (loc_id_or_boreholeno: number | string) => ['images', loc_id_or_boreholeno] as const,
  images: () => ['images'] as const,
  dtm: () => ['dtm'] as const,
  locationTypes: () => ['location_types'] as const,
  timeseriesTypes: () => ['timeseries_types'] as const,
  boreholeMap: () => ['borehole_map'] as const,
  user: () => ['user'] as const,
  overblik: () => ['overblik'] as const,
  overblikByLocId: (loc_id: number | undefined) => ['overblik', loc_id] as const,
  notificationTypes: () => ['notification_types'] as const,
  changeReasons: () => ['change_reasons'] as const,
  actions: (unit_uuid: string | undefined) => ['actions', unit_uuid] as const,
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
