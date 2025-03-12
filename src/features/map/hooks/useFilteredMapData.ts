import {NotificationMap, useNotificationOverviewMap} from '~/hooks/query/useNotificationOverview';
import {useMapFilterStore} from '../store';
import {Filter} from '~/pages/field/overview/components/filter_consts';
import {BoreholeMapData} from '~/types';
import {useMemo, useState} from 'react';
import {useBoreholeMap} from '~/hooks/query/useBoreholeMap';

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

const searchAcrossAll = (data: (NotificationMap | BoreholeMapData)[], search_string: string) => {
  if (search_string === '') return data;
  return data.filter((elem) => searchElement(elem, search_string));
};

const filterSensor = (data: NotificationMap, filter: Filter['sensor']) => {
  if (data.loctype_id === 12) return filter.isSingleMeasurement;
  const serviceFilter =
    filter.isCustomerService === 'indeterminate'
      ? true
      : data.is_customer_service === filter.isCustomerService || data.is_customer_service === null;
  const activeFilter = data.active == true || data.active == null ? true : filter.showInactive;
  const keepLocationsWithoutNotifications =
    data.type === 'none' ? !filter.hideLocationsWithoutNotifications : true;
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

const filterData = (data: (NotificationMap | BoreholeMapData)[], filter: Filter) => {
  let filteredData = data;

  filteredData = filteredData.filter((elem): elem is NotificationMap =>
    'notification_id' in elem ? filterSensor(elem, filter.sensor) : true
  );

  filteredData = filteredData.filter((elem): elem is BoreholeMapData =>
    'boreholeno' in elem ? filterBorehole(elem, filter.borehole) : true
  );

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
  const {data: mapData} = useNotificationOverviewMap();

  const {data: boreholeMapdata} = useBoreholeMap();
  const [extraData, setExtraData] = useState<NotificationMap | BoreholeMapData | null>(null);

  const data = useMemo(() => {
    return [...(mapData ?? []), ...(boreholeMapdata ?? []), ...(extraData ? [extraData] : [])];
  }, [mapData, boreholeMapdata, extraData]);

  const {filters, locIds} = useMapFilterStore((state) => state);

  const mapFilteredData = useMemo(() => {
    const filteredData = filterData(searchAcrossAll(data, filters.freeText ?? ''), filters);
    return filteredData;
  }, [data, filters]);

  const listFilteredData = useMemo(() => {
    if (locIds.length > 0) {
      const filteredLocIds = new Set(locIds);
      return mapFilteredData.filter((elem) => 'loc_id' in elem && filteredLocIds.has(elem.loc_id));
    }
    return mapFilteredData;
  }, [mapFilteredData, locIds]);

  return {
    data,
    setExtraData,
    mapFilteredData,
    listFilteredData,
  };
};
