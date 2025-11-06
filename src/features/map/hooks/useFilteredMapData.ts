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
/**
 * Filters the sensor data based on the provided filter criteria.
 * if keepLocationsWithoutNotifications is false it will hide locations without notifications - inactive locations included.
 */
const filterSensor = (data: MapOverview, filter: Filter['sensor']) => {
  const isNewInstallation =
    data.not_serviced && data.inactive_new && !data.in_service && !data.has_task;

  const isInactive = data.inactive_new && !data.not_serviced && !data.in_service;

  if (filter.nyOpsætning) return isNewInstallation;
  const customerServiceFilter = filter.showCustomerService === data.is_customer_service;
  const watsoncServiceFilter =
    filter.showWatsonCService === !data.is_customer_service || data.is_customer_service === null;

  const serviceFilter =
    (watsoncServiceFilter && customerServiceFilter) ||
    (filter.showCustomerService && filter.showWatsonCService);

  const activeFilter = isInactive
    ? filter.showInactive ||
      data.has_task ||
      (data.notification_ids ? data.notification_ids.length > 0 : false)
    : true;

  const keepLocationsWithoutNotifications =
    (!data.has_task || !data.due_date?.isBefore(dayjs().add(1, 'month'))) &&
    !data.itinerary_id &&
    data.flag === null
      ? !filter.hideLocationsWithoutNotifications
      : true;

  return keepLocationsWithoutNotifications && activeFilter && serviceFilter;
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

const filterData = (data: (MapOverview | BoreholeMapData)[], filter: Filter) => {
  let filteredData = data;

  filteredData = filteredData.filter((elem): elem is MapOverview =>
    'loc_id' in elem ? filterSensor(elem, filter.sensor) : true
  );

  filteredData = filteredData.filter((elem): elem is BoreholeMapData =>
    'boreholeno' in elem ? filterBorehole(elem, filter.borehole) : true
  );

  if (filter.notificationTypes?.length > 0) {
    filteredData = filteredData.filter((elem) => {
      if ('loc_id' in elem) {
        return filter.notificationTypes.some((type) => elem.notification_ids?.includes(type));
      }
      return false;
    });
  }

  if (filter.groups && filter.groups.length > 0) {
    filteredData = filteredData.filter((elem) => {
      if (elem.groups !== null) {
        return filter.groups.some((group) => elem.groups.some((item) => item.id === group.id));
      }
      return false;
    });
  }

  if (filter.projects && filter.projects.length > 0) {
    filteredData = filteredData.filter((elem) => {
      if ('loc_id' in elem && elem.projectno) {
        return filter.projects.some((project) => elem.projectno === project.project_no);
      }
      return false;
    });
  }

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
    const filteredData = filterData(searchAcrossAll(data, filters.freeText ?? ''), filters);
    return [...filteredData, ...(extraData ? [extraData] : [])];
  }, [data, filters, extraData]);

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
