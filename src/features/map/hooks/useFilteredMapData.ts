import {MapOverview, NotificationMap, useMapOverview} from '~/hooks/query/useNotificationOverview';
import {useMapFilterStore} from '../store';
import {Filter} from '~/pages/field/overview/components/filter_consts';
import {BoreholeMapData} from '~/types';
import {useMemo, useState} from 'react';
import {useBoreholeMap} from '~/hooks/query/useBoreholeMap';
import {locationListSortingAtom} from '~/state/atoms';
import {useAtomValue} from 'jotai';
import moment from 'moment';

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

const filterSensor = (data: MapOverview, filter: Filter['sensor']) => {
  if (data.loctype_id === 12) return filter.isSingleMeasurement;
  const serviceFilter =
    filter.isCustomerService === 'indeterminate'
      ? true
      : data.is_customer_service === filter.isCustomerService || data.is_customer_service === null;
  const activeFilter = data.inactive != true ? true : filter.showInactive;
  const keepLocationsWithoutNotifications =
    !data.has_task && data.flag === null ? !filter.hideLocationsWithoutNotifications : true;
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

// const sortByDueDate = (filteredList: (MapOverview | BoreholeMapData)[], sortingAtom: string) => {
//   filteredList.sort((a, b) => {
//     if ('loc_id' in a && 'loc_id' in b) {
//       if (sortingAtom === 'Oldest') {
//         if (a.dato === null) return -1;
//         if (b.dato === null) return 1;
//         return moment(b.dato).diff(moment(a.dato));
//       }
//       if (sortingAtom === 'Newest') {
//         if (a.dato === null) return 1;
//         if (b.dato === null) return -1;
//         return moment(a.dato).diff(moment(b.dato));
//       }
//     } else {
//       return -1;
//     }

//     return 0;
//   });
// };

export const useFilteredMapData = () => {
  const {data: mapData} = useMapOverview();
  const sortingAtom = useAtomValue(locationListSortingAtom);
  const {data: boreholeMapdata} = useBoreholeMap();
  const [extraData, setExtraData] = useState<MapOverview | BoreholeMapData | null>(null);

  const data = useMemo(() => {
    return [...(mapData ?? []), ...(boreholeMapdata ?? []), ...(extraData ? [extraData] : [])];
  }, [mapData, boreholeMapdata, extraData]);

  const {filters, locIds} = useMapFilterStore((state) => state);

  const mapFilteredData = useMemo(() => {
    const filteredData = filterData(searchAcrossAll(data, filters.freeText ?? ''), filters);
    return filteredData;
  }, [data, filters]);

  const listFilteredData = useMemo(() => {
    let filteredList = mapFilteredData;
    if (locIds.length > 0) {
      const filteredLocIds = new Set(locIds);
      filteredList = mapFilteredData.filter(
        (elem) => 'loc_id' in elem && filteredLocIds.has(elem.loc_id)
      );

      // sortByDueDate(filteredList, sortingAtom);
    }

    return filteredList;
  }, [mapFilteredData, locIds, sortingAtom]);

  return {
    data,
    setExtraData,
    mapFilteredData,
    listFilteredData,
  };
};
