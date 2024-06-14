import SaveIcon from '@mui/icons-material/Save';
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

import Button from '~/components/Button';
import {NotificationMap} from '~/hooks/query/useNotificationOverview';
import useBreakpoints from '~/hooks/useBreakpoints';
import {postElasticSearch} from '~/pages/field/boreholeAPI';
import FilterOptions from '~/pages/field/overview/components/FilterOptions';
import {authStore} from '~/state/store';

import type {BoreholeData} from '../OverviewPage';

interface LocItems {
  name: string;
  sensor: boolean;
  group: string;
}

export interface Filter {
  freeText?: string;
  borehole: {
    hasControlProgram?: boolean;
  };
  sensor: {
    showInactive: boolean;
  };
}

const typeAheadAtom = atom<string>('');
const mapFilterAtom = atomWithStorage<Filter>('mapFilter', {
  freeText: '',
  borehole: {},
  sensor: {
    showInactive: false,
  },
});

const getNumberOfNonEmptyFilters = (filter: Filter) => {
  return Object.values(filter).filter((val) => {
    if (typeof val === 'string' && val.trim() === '') return false;
    if (typeof val === 'number' && val === null) return false;
    if (typeof val === 'object' && (val === null || Object.keys(val).length == 0)) return false;
    if (typeof val === 'boolean' && val === false) return false;
    if (Array.isArray(val) && val.length === 0) return false;
    return true;
  }).length;
};

type Props = {
  data: (NotificationMap | BoreholeData)[];
  setData: (data: (NotificationMap | BoreholeData)[]) => void;
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

const searchAcrossAll = (data: (NotificationMap | BoreholeData)[], search_string: string) => {
  if (search_string === '') return data;
  return data.filter((elem) => searchElement(elem, search_string));
};

const filterSensor = (data: NotificationMap, filter: Filter['sensor']) => {
  return data.active ? true : filter.showInactive;
};

const filterBorehole = (data: BoreholeData, filter: Filter['borehole']) => {
  return true;
};

const filterChecked = (data: (NotificationMap | BoreholeData)[], filter: Filter) => {
  let filteredData = data;

  filteredData = filteredData.filter((elem): elem is NotificationMap =>
    'locid' in elem ? filterSensor(elem, filter.sensor) : true
  );

  filteredData = filteredData.filter((elem): elem is BoreholeData =>
    'boreholeno' in elem ? filterBorehole(elem, filter.borehole) : true
  );

  return filteredData;
};

const SearchAndFilter = ({data, setData, handleSearchSelect}: Props) => {
  const searchRef = useRef(null);
  const [typeAhead, setTypeAhead] = useAtom(typeAheadAtom);
  const [mapFilter, setMapFilter] = useAtom(mapFilterAtom);
  const [locItems, setLocItems] = useState<LocItems[]>([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const {isTouch} = useBreakpoints();
  const [boreholeAccess] = authStore((state) => [state.boreholeAccess]);

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
            'locid' in elem && elem.locname.toLowerCase().includes(search_string?.toLowerCase())
        )
        .map((elem) => {
          return {name: elem.locname, sensor: true, group: 'IoT'};
        })
        .sort((a, b) => a.name.localeCompare(b.name));

      let filteredBorehole: LocItems[] = [];
      if (boreholeAccess) {
        const search = {
          query: {
            bool: {
              must: {
                query_string: {
                  query: search_string,
                },
              },
            },
          },
        };
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
    const filtered = filterChecked(searchAcrossAll(data, mapFilter.freeText ?? ''), mapFilter);
    setData(filtered);
  }, [mapFilter, data, setData]);

  const handleOpenFilter: MouseEventHandler<HTMLButtonElement> = () => {
    setAnchorEl(searchRef.current);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
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
                <InputAdornment
                  sx={{
                    pl: 1,
                  }}
                  position="start"
                >
                  <SearchRoundedIcon />
                </InputAdornment>
              ),
              endAdornment: params.InputProps.endAdornment ? (
                params.InputProps.endAdornment
              ) : (
                <InputAdornment
                  sx={{
                    pr: 1,
                  }}
                  position="end"
                >
                  <IconButton edge="end" onClick={handleOpenFilter}>
                    <Badge badgeContent={getNumberOfNonEmptyFilters(mapFilter)} color="primary">
                      <TuneRoundedIcon
                        color={getNumberOfNonEmptyFilters(mapFilter) > 0 ? 'primary' : undefined}
                      />
                    </Badge>
                  </IconButton>
                </InputAdornment>
              ),
            }}
            placeholder="Søg efter lokation..."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '9999px',
              },
            }}
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
        onClose={handleClose}
        sx={{
          '& .MuiPaper-root': {
            width: isTouch ? '90%' : 300,
            p: 1,
          },
        }}
      >
        <FilterOptions filters={mapFilter} setFilter={setMapFilter} />
      </Menu>
    </>
  );
};

export default SearchAndFilter;