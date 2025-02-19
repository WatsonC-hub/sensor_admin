import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import {
  Autocomplete,
  TextField,
  InputAdornment,
  Menu,
  AutocompleteInputChangeReason,
  Badge,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import {atom, useAtom} from 'jotai';
import {atomWithStorage} from 'jotai/utils';
import React, {useState, useRef, SyntheticEvent, MouseEventHandler, useEffect} from 'react';

import {NotificationMap} from '~/hooks/query/useNotificationOverview';
import useBreakpoints from '~/hooks/useBreakpoints';
import {postElasticSearch} from '~/pages/field/boreholeAPI';
import {Filter, defaultMapFilter} from '~/pages/field/overview/components/filter_consts';
import FilterOptions from '~/pages/field/overview/components/FilterOptions';
import {useAuthStore} from '~/state/store';
import {BoreholeMapData} from '~/types';

interface LocItems {
  name: string;
  sensor: boolean;
  group: string;
}

const typeAheadAtom = atom<string>('');

const mapFilterAtom = atomWithStorage<Filter>('mapFilter', defaultMapFilter);

const getNumberOfNonDefaultFilters = <T extends object>(filter: T, default_val: T): number => {
  return Object.entries(filter).reduce((acc, entry) => {
    const [key, val] = entry;
    if (typeof val === 'object' && !Array.isArray(val) && val !== null) {
      // @ts-expect-error Key has to be keyof T
      return acc + getNumberOfNonDefaultFilters(val, default_val[key]);
    }
    // @ts-expect-error Key has to be keyof T
    if (JSON.stringify(val) === JSON.stringify(default_val[key])) {
      return acc;
    }
    return acc + 1;
  }, 0);
};

type Props = {
  data: (NotificationMap | BoreholeMapData)[];
  setData: (data: (NotificationMap | BoreholeMapData)[]) => void;
  handleSearchSelect: (e: SyntheticEvent, value: string | LocItems | null) => void;
};

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

const SearchAndFilter = ({data, setData, handleSearchSelect}: Props) => {
  const searchRef = useRef(null);
  const [typeAhead, setTypeAhead] = useAtom(typeAheadAtom);
  const [mapFilter, setMapFilter] = useAtom(mapFilterAtom);
  const [locItems, setLocItems] = useState<LocItems[]>([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const {isTouch} = useBreakpoints();
  const [boreholeAccess] = useAuthStore((state) => [state.boreholeAccess]);

  const elasticSearch = (
    e: SyntheticEvent,
    value: string,
    reason: AutocompleteInputChangeReason
  ) => {
    const search_string = value;
    if (typeof search_string == 'string') {
      setTypeAhead(search_string);
    }

    if (reason == 'clear') {
      setTypeAhead('');
    }
    if (search_string) {
      const filteredSensor = data
        .filter(
          (elem): elem is NotificationMap =>
            'notification_id' in elem &&
            elem.loc_name.toLowerCase().includes(search_string?.toLowerCase())
        )
        .map((elem) => {
          return {name: elem.loc_name, sensor: true, group: 'IoT'};
        })
        .sort((a, b) => a.name.localeCompare(b.name));

      let filteredBorehole: LocItems[] = [];
      if (boreholeAccess) {
        const search = {query: {bool: {must: {query_string: {query: search_string}}}}};
        postElasticSearch(search).then((res) => {
          filteredBorehole = res.data.hits.hits.map((elem: any) => {
            return {name: elem._source.properties.boreholeno, group: 'Jupiter'};
          });
          setLocItems([...filteredSensor, ...filteredBorehole]);
        });
      } else {
        setLocItems([...filteredSensor, ...filteredBorehole]);
      }
    }
  };

  useEffect(() => {
    if (data.length > 0) {
      const filtered = filterData(searchAcrossAll(data, mapFilter.freeText ?? ''), mapFilter);
      setData(filtered);
    }
  }, [mapFilter, data, setData]);

  const handleOpenFilter: MouseEventHandler<HTMLButtonElement> = () => {
    setAnchorEl(searchRef.current);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const numFilters = getNumberOfNonDefaultFilters(mapFilter, defaultMapFilter);
  return (
    <>
      <Autocomplete
        ref={searchRef}
        freeSolo={true}
        forcePopupIcon={false}
        options={locItems}
        getOptionLabel={(option) => (typeof option == 'object' ? option.name : option)}
        groupBy={(option) => option.group}
        inputValue={typeAhead}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment sx={{pl: 1}} position="start">
                  <SearchRoundedIcon />
                </InputAdornment>
              ),
              endAdornment: params.InputProps.endAdornment ? (
                params.InputProps.endAdornment
              ) : (
                <InputAdornment sx={{pr: 1}} position="end">
                  <IconButton edge="end" onClick={handleOpenFilter}>
                    <Badge badgeContent={numFilters} color="primary">
                      <TuneRoundedIcon color={numFilters > 0 ? 'primary' : undefined} />
                    </Badge>
                  </IconButton>
                </InputAdornment>
              ),
            }}
            placeholder="Søg efter lokation..."
            sx={{'& .MuiOutlinedInput-root': {borderRadius: '9999px', backgroundColor: 'white'}}}
          />
        )}
        sx={{
          width: isTouch ? '90%' : 300,
          marginLeft: '5%',
          marginBottom: '12px',
          marginTop: '12px',
        }}
        onChange={handleSearchSelect}
        onInputChange={elasticSearch}
      />
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => {
          handleClose();
        }}
        sx={{'& .MuiPaper-root': {width: isTouch ? '90%' : 500, p: 1}}}
      >
        <FilterOptions
          filters={mapFilter}
          onClose={handleClose}
          onSubmit={(filter) => {
            // handleClose();
            setMapFilter(filter);
          }}
        />
      </Menu>
    </>
  );
};

export default React.memo(SearchAndFilter);
