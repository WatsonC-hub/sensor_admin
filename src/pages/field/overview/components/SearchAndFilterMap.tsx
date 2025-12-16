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

import React, {useState, useRef, SyntheticEvent, MouseEventHandler} from 'react';
import {useUser} from '~/features/auth/useUser';
import {useMapFilterStore} from '~/features/map/store';

import {MapOverview} from '~/hooks/query/useNotificationOverview';
import useBreakpoints from '~/hooks/useBreakpoints';
import {postElasticSearch} from '~/pages/field/boreholeAPI';
import {defaultMapFilter} from '~/pages/field/overview/components/filter_consts';
import FilterOptions from '~/pages/field/overview/components/FilterOptions';
import {BoreholeMapData} from '~/types';

interface LocItems {
  name: string;
  sensor: boolean;
  group: string;
}

// const mapFilterAtom = atomWithStorage<Filter>('mapFilter', defaultMapFilter);

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
  data: (MapOverview | BoreholeMapData)[];
  handleSearchSelect: (e: SyntheticEvent, value: string | LocItems | null) => void;
};

const SearchAndFilter = ({data, handleSearchSelect}: Props) => {
  const searchRef = useRef(null);

  // const [mapFilter, setMapFilter] = useAtom(mapFilterAtom);
  const [typeAhead, setTypeAhead, mapFilter] = useMapFilterStore((state) => [
    state.search,
    state.setSearch,
    state.filters,
  ]);
  const [locItems, setLocItems] = useState<LocItems[]>([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const {isMobile} = useBreakpoints();
  const {
    features: {boreholeAccess},
    superUser,
  } = useUser();

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
          (elem): elem is MapOverview =>
            'loc_id' in elem && elem.loc_name.toLowerCase().includes(search_string?.toLowerCase())
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

  const handleOpenFilter: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setAnchorEl(searchRef.current);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const numFilters = getNumberOfNonDefaultFilters(mapFilter, defaultMapFilter(superUser));
  return (
    <>
      <Autocomplete
        ref={searchRef}
        freeSolo={true}
        forcePopupIcon={false}
        options={locItems}
        autoHighlight
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
          width: isMobile ? '90%' : 300,
          marginLeft: '16px',
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
        sx={{'& .MuiPaper-root': {width: isMobile ? '90%' : 500, p: 1}}}
      >
        <FilterOptions onClose={handleClose} />
      </Menu>
    </>
  );
};

export default React.memo(SearchAndFilter);
