import {MapOverview, useMapOverview} from '~/hooks/query/useNotificationOverview';
import {useMapFilterStore} from '../store';
import {Filter} from '~/pages/field/overview/components/filter_consts';
import {BoreholeMapData} from '~/types';
import {useMemo, useState} from 'react';
import {useBoreholeMap} from '~/hooks/query/useBoreholeMap';
import {assignedToAtom} from '~/state/atoms';
import {useAtomValue} from 'jotai';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';
import moment from 'moment';
import {isEmptyObject} from '~/helpers/guardHelper';

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
  if (data.loctype_id === 12) return filter.isSingleMeasurement;
  const serviceFilter =
    filter.isCustomerService === 'indeterminate'
      ? true
      : data.is_customer_service === filter.isCustomerService || data.is_customer_service === null;
  const activeFilter = data.inactive != true ? true : filter.showInactive || data.has_task;
  const keepLocationsWithoutNotifications =
    (!data.has_task || !moment(data.due_date).isBefore(moment().add(1, 'month').toDate())) &&
    !data.itinerary_id &&
    data.flag === null &&
    !data.no_unit
      ? !filter.hideLocationsWithoutNotifications
      : true;
  return (
    keepLocationsWithoutNotifications &&
    activeFilter &&
    serviceFilter &&
    !filter.isSingleMeasurement
  );
};

const filterBorehole = (data: BoreholeMapData, filter: Filter['borehole']) => {
  switch (filter.hasControlProgram) {
    case true:
      return data.num_controls_in_a_year.some((num) => num > 0);
    case false:
      return !data.num_controls_in_a_year.some((num) => num > 0);
    case 'indeterminate':
      return true;
  }
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
      if ('notification_id' in elem && elem.notification_id !== null) {
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

  return filteredData;
};

export const useFilteredMapData = () => {
  const {data: mapData} = useMapOverview();
  const assignedToListFilter = useAtomValue(assignedToAtom);
  const {data: boreholeMapdata} = useBoreholeMap();
  const [extraData, setExtraData] = useState<MapOverview | BoreholeMapData | null>(null);
  const {tasks} = useTaskStore();

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
        // tasks that are in locIds should be at the top of the list
        if (locIds.includes(a.loc_id) && !locIds.includes(b.loc_id)) return -1;

        if (!locIds.includes(a.loc_id) && locIds.includes(b.loc_id)) return 1;

        const aList = tasks?.filter((task) => task.loc_id === a.loc_id);
        const bList = tasks?.filter((task) => task.loc_id === b.loc_id);
        if (aList && bList) {
          const aDate = aList.sort((a, b) => {
            if (!a.due_date) return 1;
            if (!b.due_date) return 1;
            if (a.due_date && b.due_date) {
              return moment(a.due_date).diff(moment(b.due_date));
            }
            return 0;
          });
          const bDate = bList.sort((a, b) => {
            if (!a.due_date) return 1;
            if (!b.due_date) return 1;
            if (a.due_date && b.due_date) {
              return moment(a.due_date).diff(moment(b.due_date));
            }
            return 0;
          });

          if (aDate.length > 0 && aDate[0].due_date && bDate.length > 0 && !bDate[0].due_date)
            return 1;

          if (aDate.length > 0 && !aDate[0].due_date && bDate.length > 0 && bDate[0].due_date)
            return 1;

          if (aDate.length > 0 && bDate.length > 0)
            return moment(aDate[0].due_date).diff(moment(bDate[0].due_date));
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
