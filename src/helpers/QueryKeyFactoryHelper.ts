import {Dayjs} from 'dayjs';

export const queryKeys = {
  Location: {
    info: (loc_id: number | undefined) =>
      [
        'metadata',
        'location_info',
        'location_access',
        'ressourcer',
        'contact_info',
        'sla_configuration',
        loc_id,
      ] as const,
    metadata: (loc_id: number | undefined) => ['location_metadata', 'metadata', loc_id] as const,
    timeseries_status: (loc_id: number | undefined) => ['timeseries_status', loc_id] as const,
    contacts: (loc_id: number) => ['contact_info', loc_id] as const,
    searchContacts: (search: string) => ['search_contact_info', search] as const,
    keys: (loc_id: number) => ['location_access', loc_id] as const,
    searchKeys: (search: string) => ['search_location_access', search] as const,
    ressources: () => ['ressourcer'] as const,
    locationRessources: (loc_id: number) => ['ressourcer', loc_id] as const,
    permissions: (loc_id: number | undefined) =>
      ['location_permissions', 'tsList', loc_id] as const,
    minimalSelectList: (loc_id: number | undefined) =>
      ['tsList', 'location_metadata', 'metadata', loc_id] as const,
    SLAConfiguration: (loc_id: number | undefined) => ['sla_configuration', loc_id] as const,
  },
  Timeseries: {
    metadata: (ts_id: number | undefined) => ['metadata', ts_id] as const,
    allPejling: () => ['kontrol', 'watlevmp'] as const,
    pejling: (ts_id: number | undefined) => ['kontrol', 'watlevmp', ts_id] as const,
    tilsyn: (ts_id: number | undefined) => ['service', 'udstyr', ts_id] as const,
    maalepunkt: (ts_id: number | undefined) => ['watlevmp', ts_id] as const,
    unitHistory: (ts_id: number | undefined) => ['udstyr', ts_id] as const,
    algorithms: (ts_id: number) => ['algorithms', ts_id] as const,
    certifyQa: (ts_id: number) => ['certifyQa', ts_id] as const,
    QAWithTsId: (ts_id: number) => ['qa_all', 'algorithms', ts_id] as const,
    qaLabels: (ts_id: number | undefined) => ['qa_labels', 'algorithms', ts_id] as const,
    removedData: (ts_id: number) => ['removed_data', ts_id] as const,
    precipitationData: (ts_id: number) => ['precipitation_data', ts_id] as const,
    linesData: (ts_id: number) => ['lines_data', 'algorithms', ts_id] as const,
    rawData: (ts_id: number) => ['rawdata', ts_id] as const,
    latestMeasurement: (ts_id: number) => ['latest_measurement', ts_id] as const,
    batteryStatus: (ts_id: number | undefined) => ['battery_status', 'udstyr', ts_id] as const,
    pollData: (ts_id: number | undefined) => ['pollData', ts_id] as const,
    pollQA: (ts_id: number | undefined) => ['pollQA', ts_id] as const,
    edgeDates: (ts_id: number | undefined) => ['all_range', 'kontrol', ts_id] as const,
    graphData: (ts_id: number | undefined, xRange: Array<Dayjs>) =>
      ['graphData', 'kontrol', ts_id, xRange] as const,
    MeasureSampleSend: (ts_id: number | undefined) =>
      ['measure_sample_send', 'udstyr', ts_id] as const,
    ServiceInterval: (ts_id: number) => ['service_interval', 'udstyr', ts_id] as const,
    SyncData: (ts_id: number) => ['sync', ts_id] as const,
    AlarmList: (ts_id: number | undefined) => ['alarm', ts_id] as const,
  },
  Borehole: {
    stamdata: (boreholeno: string | undefined | null, intakeno: number | undefined) =>
      ['borehole_stamdata', boreholeno, intakeno] as const,
    findBorehole: (boreholeno: string | undefined | null) =>
      ['search_borehole', boreholeno] as const,
    intakeList: (boreholeno: string | undefined | null) => ['intake_list', boreholeno] as const,
    jupiterData: (boreholeno: string | undefined | null, intakeno: number | undefined) =>
      ['jupiter_waterlevel', 'measurements', boreholeno, intakeno] as const,
    measurementsWithIntake: (boreholeno: string | undefined | null, intakeno: number | undefined) =>
      ['measurements', 'borehole_watlevmp', boreholeno, intakeno] as const,
    measurements: (boreholeno: string | undefined | null) =>
      ['measurements', 'borehole_watlevmp', boreholeno] as const,
    watlevmpWithIntake: (boreholeno: string | undefined | null, intakeno: number | undefined) =>
      ['borehole_watlevmp', boreholeno, intakeno] as const,
    watlevmp: (boreholeno: string | undefined | null) => ['borehole_watlevmp', boreholeno] as const,
    minimalSelect: (boreholeno: string | undefined | null) => ['borehole', boreholeno] as const,
    lastMP: (boreholeno: string | undefined | null, intakeno: number | undefined) =>
      ['last_jupiter_mp', 'borehole_watlevmp', boreholeno, intakeno] as const,
  },
  Map: {
    all: () => ['map'] as const,
  },
  Tasks: {
    all: () => ['all_tasks', 'tasks'] as const,
    closedTasks: (loc_id: number | undefined) => ['tasks', loc_id] as const,
    taskHistory: (task_id: string) => ['tasks_history', 'tasks', task_id] as const,
    nextDueDate: (ts_id: number | undefined) =>
      ['next_due_date', 'service_interval', ts_id] as const,
    taskUsers: () => ['task_users'] as const,
    taskStatus: () => ['task_status'] as const,
  },
  Itineraries: {
    all: () => ['tasks', 'itineraries'] as const,
    byId: (itinerary_id: string | null) => ['tasks', 'itineraries', itinerary_id] as const,
    itineraryTasks: (itinerary_id: string | undefined) =>
      ['tasks', itinerary_id, 'itineraries'] as const,
    itineraryCollection: (itinerary_id: string | null) =>
      ['tasks', 'collection', itinerary_id, 'itineraries'] as const,
  },
  Parking: {
    all: () => ['parking'] as const,
  },
  Routes: {
    all: () => ['leaflet_map_route'] as const,
  },
  BoreholePermissions: {
    all: () => ['borehole_permissions', 'metadata'] as const,
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
  dtm: () => ['dtm'] as const,
  locationTypes: () => ['location_types'] as const,
  timeseriesTypes: () => ['timeseries_types'] as const,
  boreholeMap: () => ['borehole_map'] as const,
  user: () => ['user'] as const,
  notificationTypes: () => ['notification_types'] as const,
  changeReasons: () => ['change_reasons'] as const,
  actions: (unit_uuid: string | undefined) => ['actions', unit_uuid] as const,
  cmdOptions: () => ['cmd_options'] as const,
  dmpAllowedMapList: () => ['dmp_allowed_map_list'] as const,
  StationProgress: () => ['station_progress'] as const,
};
