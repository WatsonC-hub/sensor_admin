import {MapOverview, useMapOverview} from '~/hooks/query/useNotificationOverview';
import {useMapFilterStore} from '../store';
import {Filter} from '~/pages/field/overview/components/filter_consts';
import {BoreholeMapData} from '~/types';
import {useMemo, useState} from 'react';
import {useBoreholeMap} from '~/hooks/query/useBoreholeMap';
import {assignedToAtom} from '~/state/atoms';
import {useAtomValue} from 'jotai';
import {useTaskState} from '~/features/tasks/api/useTaskState';
import {isEmptyObject} from '~/helpers/guardHelper';
import dayjs, {Dayjs} from 'dayjs';
import {useUser} from '~/features/auth/useUser';
import {Task} from '~/features/tasks/types';

const searchValue = (value: any, search_string: string): boolean => {
  if (typeof value === 'string') {
    return value.toLowerCase().includes(search_string.toLowerCase());
  }
  if (typeof value === 'number') {
    return value.toString().includes(search_string);
  }
  if (Array.isArray(value)) {
    return value.some((val) => searchValue(val, search_string));
  }
  if (typeof value === 'object' && value !== null) {
    return searchElement(value, search_string);
  }
  return false;
};

const searchElement = (elem: object, search_string: string) => {
  return Object.values(elem).some((value) => searchValue(value, search_string));
};

const searchAcrossAll = (data: (MapOverview | BoreholeMapData)[], search_string: string) => {
  if (search_string === '') return data;
  return data.filter((elem) => searchElement(elem, search_string));
};

const filterSensor = (data: MapOverview, showService: Filter['showService']) => {
  return (
    showService === (data.is_customer_service ? 'kunde' : 'watsonc') || showService === 'begge'
  );
};

const extendMapData = (elem: MapOverview, filter: Filter, tasks: Task[], user_id: string) => {
  const isFaultLess =
    (elem.notification_ids === null || elem.notification_ids.length === 0) &&
    !elem.has_task &&
    !elem.itinerary_id &&
    !elem.not_serviced &&
    !elem.inactive_new;

  const isInService = elem.in_service && elem.inactive_new;

  // Der er opgaver som ikke har en dato. Det gør at lokationen ikke vises eftersom vi viser lokationer med due_date 1 måned frem.
  const hasNotifications =
    (elem.notification_ids && elem.notification_ids.length > 0 && !elem.has_task) ||
    (elem.has_task && elem.due_date?.isBefore(dayjs().add(1, 'month'))) ||
    elem.itinerary_id
      ? true
      : false;

  // De Ovenstående opgaver vises dog under inaktive fordi lokationen er inaktiv.
  const isInactive = elem.inactive_new && !elem.not_serviced && !elem.in_service;

  const isNewInstallation =
    elem.not_serviced && elem.inactive_new && !elem.in_service && !elem.has_task;

  const filtered_tasks = tasks?.filter(
    (task) => task.loc_id === elem.loc_id && elem.due_date?.isBefore(dayjs().add(1, 'month'))
  );

  const isAssignedToMe = filtered_tasks?.some(
    (task) => task.assigned_to !== null && task.assigned_to === user_id
  );

  const not_handled_tasks = filtered_tasks?.some(
    (task) =>
      task.status_category === 'unstarted' &&
      !task.blocks_notifications.includes(207) &&
      !task.blocks_notifications.includes(1)
  );

  const not_handled_field_tasks = filtered_tasks?.some(
    (task) =>
      task.status_id === 2 &&
      (task.blocks_notifications.includes(207) ||
        task.blocks_notifications.includes(1) ||
        task.blocks_notifications.length === 0)
  );

  const add_to_map = filter.locationFilter?.some((filterName) => {
    if (filterName === 'Fejlfri' && isFaultLess) return true;
    if (filterName === 'Tildelt til mig' && isAssignedToMe) return true;
    if (filterName === 'Notifikationer' && hasNotifications) return true;
    if (filterName === 'Enkeltmålestationer' && isInService) return true;
    if (filterName === 'Nyopsætninger' && isNewInstallation) return true;
    if (filterName === 'Inaktive' && isInactive) return true;
    if (filterName === 'Uplanlagte opgaver' && not_handled_tasks && elem.itinerary_id === null)
      return true;
    if (
      filterName === 'Uplanlagt feltarbejde' &&
      not_handled_field_tasks &&
      elem.itinerary_id === null
    )
      return true;
    return false;
  });

  return add_to_map;
};

const filterBorehole = (data: BoreholeMapData, filter: Filter['borehole']) => {
  if (filter.showHasControlProgram && filter.showNoControlProgram) return true;

  const hasControlProgram = data.num_controls_in_a_year.some((num) => num > 0);

  if (filter.showHasControlProgram && hasControlProgram) {
    return true;
  }

  if (filter.showNoControlProgram && !hasControlProgram) {
    return true;
  }

  return false;
};

const filterData = (
  data: (MapOverview | BoreholeMapData)[],
  filter: Filter,
  user_id: number,
  tasks: Array<Task> | undefined
) => {
  let filteredData = data;

  filteredData = filteredData.filter((elem): elem is MapOverview =>
    'loc_id' in elem ? filterSensor(elem, filter.showService) : true
  );

  filteredData = filteredData.filter((elem): elem is BoreholeMapData =>
    'boreholeno' in elem ? filterBorehole(elem, filter.borehole) : true
  );

  if (
    filter.groups.length === 0 &&
    filter.projects.length === 0 &&
    filter.notificationTypes.length === 0
  ) {
    filteredData = filteredData.filter((elem) => {
      if ('loc_id' in elem) {
        const extend_map_data = extendMapData(elem, filter, tasks ?? [], user_id.toString());

        return extend_map_data;
      }
    });
  }

  if (filter.notificationTypes?.length > 0) {
    filteredData = filteredData.filter((elem) => {
      if ('loc_id' in elem) {
        return filter.notificationTypes.some((type) => elem.notification_ids?.includes(type));
      }
      return false;
    });
  }

  filteredData = filteredData.filter((elem) => {
    let matchGroupsAndProjects = filter.groups.length === 0 && filter.projects.length === 0;
    if (filter.groups.length > 0) {
      matchGroupsAndProjects = filter.groups.some((group) =>
        elem.groups?.some((item) => item.id === group.id)
      );
    }
    if (filter.projects.length > 0 && !matchGroupsAndProjects) {
      if ('loc_id' in elem && elem.projectno) {
        matchGroupsAndProjects = filter.projects.some(
          (project) => elem.projectno === project.project_no
        );
      }
    }
    return matchGroupsAndProjects;
  });

  return filteredData;
};

function getMinDate(dates: (Dayjs | null)[]): Dayjs | null {
  const validDates = dates.filter((d) => d !== null && !isNaN(d.valueOf()));

  if (validDates === undefined || validDates.length === 0) return null;

  return dayjs(Math.min(...validDates.filter((d) => d !== null).map((d) => d.valueOf())));
}

const mapSelect = (data: MapOverview[]) =>
  data.map((item) => ({
    ...item,
    due_date: item.due_date ? dayjs(item.due_date) : null,
  })) ?? [];

export const useFilteredMapData = () => {
  const {data: mapData} = useMapOverview({
    select: mapSelect,
  });
  const {user_id} = useUser();
  const assignedToListFilter = useAtomValue(assignedToAtom);
  const {data: boreholeMapdata} = useBoreholeMap();
  const [extraData, setExtraData] = useState<MapOverview | BoreholeMapData | null>(null);
  const {tasks} = useTaskState();

  const data = useMemo(() => {
    return [
      ...(!isEmptyObject(mapData) ? (mapData ?? []) : []),
      ...(!isEmptyObject(boreholeMapdata) ? (boreholeMapdata ?? []) : []),
    ];
  }, [mapData, boreholeMapdata]);

  const {filters, locIds} = useMapFilterStore((state) => state);

  const mapFilteredData = useMemo(() => {
    const filteredData = filterData(
      searchAcrossAll(data, filters.freeText ?? ''),
      filters,
      user_id,
      tasks
    );
    return [...filteredData, ...(extraData ? [extraData] : [])];
  }, [data, filters, extraData, user_id]);

  const listFilteredData = useMemo(() => {
    let filteredList = mapFilteredData;
    if (assignedToListFilter == null) {
      const filteredLocIds = new Set(locIds);
      filteredList = mapFilteredData.filter((elem) => {
        if ('loc_id' in elem) return filteredLocIds.has(elem.loc_id);
        return filteredLocIds.has(elem.boreholeno);
      });
    }

    if (assignedToListFilter) {
      filteredList = filteredList.filter((elem) => {
        if ('loc_id' in elem) {
          return tasks?.some(
            (task) =>
              task.loc_id === elem.loc_id &&
              (task.assigned_to === assignedToListFilter.id ||
                (assignedToListFilter.id === 'ikke tildelt' && task.assigned_to === null))
          );
        }
        return false;
      });
    }

    filteredList.sort((a, b) => {
      if ('loc_id' in a && 'loc_id' in b) {
        const aList = tasks?.filter((task) => task.loc_id === a.loc_id);
        const bList = tasks?.filter((task) => task.loc_id === b.loc_id);

        if (aList?.length === 0) return -1;
        if (bList?.length === 0) return -1;

        if (aList && bList) {
          const aDate = getMinDate(aList.map((task) => task.due_date));
          const bDate = getMinDate(bList.map((task) => task.due_date));

          if (aDate && bDate) return bDate.diff(aDate);
        }
        return -1;
      }
      return -1;
    });

    return filteredList;
  }, [mapFilteredData, locIds, assignedToListFilter]);

  return {
    data,
    setExtraData,
    mapFilteredData,
    listFilteredData,
  };
};
