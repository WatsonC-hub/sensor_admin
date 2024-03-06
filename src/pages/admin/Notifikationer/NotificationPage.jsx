import {
  Box,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
} from '@mui/material';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {atom, useAtom} from 'jotai';
import {reverse, sortBy, uniqBy} from 'lodash';
import React, {useEffect, useState} from 'react';
import NavBar from '~/components/NavBar';
import {apiClient} from '~/apiClient';
import ServiceMap from '~/pages/admin/Notifikationer/ServiceMap';
import {useNotificationOverview} from '../../../hooks/query/useNotificationOverview';
import useBreakpoints from '../../../hooks/useBreakpoints';
import {authStore} from '../../../state/store';
import NotificationTree from './NotificationTree';

const getNavigation = (item) => {
  switch (item.color) {
    case '#9F2B68':
      return `/admin/kvalitetssikring/${item.stationid}`;
    case '#334FFF':
      return `/admin/kvalitetssikring/${item.stationid}`;
    default:
      return `/field/location/${item.locid}/${item.stationid}`;
  }
};

const colors = ['#FF0000', '#FF6C00', '#FFFF00', '#00FF00', '#9F2B68', '#334FFF'];
const tasktype = ['Kritisk', 'Middel', 'Lav', 'OK', 'Kvalitetssikring', 'Plateau'];
const selectFiltersAtom = atom(colors);
const lassoFilterAtom = atom(new Set());
const isCustomerServiceAtom = atom(false);
const isWatsonCServiceAtom = atom(true);
const isFirstLoadAtom = atom(true);

const NotificationPage = () => {
  const [mapdata, setMapdata] = useState([]);
  const [lassoFilter, setLassoFilter] = useAtom(lassoFilterAtom);
  const [selectFilters, setSelectFilters] = useAtom(selectFiltersAtom);
  const [isCustomerService, setIsCustomerService] = useAtom(isCustomerServiceAtom);
  const [isWatsonCService, setIsWatsonCService] = useAtom(isWatsonCServiceAtom);
  const [isFirstLoad, setIsFirstLoad] = useAtom(isFirstLoadAtom);
  const superUser = authStore((state) => state.superUser);

  useEffect(() => {
    if (isFirstLoad) {
      if (superUser) {
        setIsWatsonCService(true);
        setIsCustomerService(false);
      } else {
        setIsWatsonCService(false);
        setIsCustomerService(true);
      }
      setIsFirstLoad(false);
    }
  }, []);

  const {isTouch} = useBreakpoints();

  const queryClient = useQueryClient();
  const {data, isLoading} = useNotificationOverview();

  const statusMutate = useMutation({
    mutationFn: async (data) => {
      const {data: out} = await apiClient.post(`/sensor_admin/overblik/update_status`, data);
      return out;
    },
    onSuccess: () => {
      queryClient.invalidateQueries('overblik');
    },
  });

  useEffect(() => {
    const sorted = reverse(
      sortBy(
        data?.filter(
          (item) =>
            selectFilters.includes(item.color) &&
            ((item.is_customer_service === isCustomerService && isCustomerService) ||
              (item.is_customer_service === !isWatsonCService && isWatsonCService))
        ),
        [(item) => (item.status ? item.status : ''), (item) => item.flag]
      )
    );
    setMapdata(uniqBy(sorted, 'locid'));
  }, [selectFilters, isCustomerService, data, isWatsonCService]);

  const trelloMutate = useMutation({
    mutationFn: async (data) => {
      // const {data: out} = await apiClient.post(`/sensor_admin/overblik/make_jira`, data);
      const {data: out2} = await apiClient.post(`/sensor_admin/overblik/make_trello`, data);
      return out2;
    },
  });

  const notifications = data
    ?.map((item, index) => {
      return {
        ...item,
        id: index,
        navigateTo: getNavigation(item),
      };
    })
    .filter((item) => (lassoFilter.size > 0 ? lassoFilter.has(item.locid) : data.length < 20));

  const handleChange = (event) => {
    const {
      target: {value},
    } = event;
    setSelectFilters(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <>
      <NavBar />

      <Grid container>
        <Grid item xs={12} md={6}>
          <Box sx={{display: 'flex', flexDirection: isTouch && 'column'}}>
            <FormControl sx={{width: isTouch ? '100%' : '40%', m: 1}}>
              <InputLabel id="demo-simple-select-label">Filter</InputLabel>
              <Select
                multiple
                value={selectFilters}
                onChange={handleChange}
                input={<OutlinedInput label="Filter" />}
                label="Filter"
                renderValue={(selected) => (
                  <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={tasktype[colors.indexOf(value)]}
                        sx={{bgcolor: value}}
                        onMouseDown={(e) => e.stopPropagation()}
                        onDelete={() =>
                          setSelectFilters(selectFilters.filter((item) => item !== value))
                        }
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          if (selectFilters.length === 1) {
                            setSelectFilters(colors);
                          } else {
                            setSelectFilters([value]);
                          }
                        }}
                      />
                    ))}
                  </Box>
                )}
              >
                {colors?.map((name, index) => (
                  <MenuItem
                    key={name}
                    value={name}
                    sx={{
                      // set background color of Mui MenuItem
                      bgcolor: name,
                      '&:hover': {bgcolor: name},
                      '&.Mui-selected': {bgcolor: name},
                      '&.Mui-selected:hover': {bgcolor: 'transparent'},
                    }}
                  >
                    {tasktype[index]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isWatsonCService}
                  onChange={(e) => setIsWatsonCService(e.target.checked)}
                />
              }
              label={'Vis WatsonC-service'}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isCustomerService}
                  onChange={(e) => setIsCustomerService(e.target.checked)}
                />
              }
              label={superUser ? 'Vis kundeservice' : 'Vis egen service'}
            />
          </Box>
          <ServiceMap data={mapdata} isLoading={isLoading} setLassoFilter={setLassoFilter} />
        </Grid>
        <Grid item xs={12} md={6}>
          <NotificationTree
            notifications={notifications}
            statusMutate={statusMutate}
            trelloMutate={trelloMutate}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default NotificationPage;
