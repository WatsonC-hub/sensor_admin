import React, {useState} from 'react';
import ServiceMap from 'src/pages/admin/Notifikationer/ServiceMap';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {apiClient} from 'src/apiClient';
import {reverse, sortBy, uniqBy, uniq} from 'lodash';
import {
  Grid,
  Button,
  Typography,
  Select,
  Box,
  Chip,
  OutlinedInput,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
} from '@mui/material';
import NotificationTree from './NotificationTree';
import {atom, useAtom} from 'jotai';
import {useEffect} from 'react';
import useBreakpoints from '../../../hooks/useBreakpoints';

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

const NotificationPage = () => {
  const [mapdata, setMapdata] = useState([]);
  const [lassoFilter, setLassoFilter] = useAtom(lassoFilterAtom);
  const [selectFilters, setSelectFilters] = useAtom(selectFiltersAtom);
  const [isCustomerService, setIsCustomerService] = useAtom(isCustomerServiceAtom);

  const {isTouch} = useBreakpoints();

  const queryClient = useQueryClient();
  const {data, isLoading} = useQuery(
    ['overblik'],
    async ({signal}) => {
      const {data} = await apiClient.get(`/sensor_admin/overblik`, {
        signal,
      });
      return data;
    },

    {
      staleTime: 1000 * 60 * 60 * 24,
    }
  );

  const statusMutate = useMutation(
    async (data) => {
      const {data: out} = await apiClient.post(`/sensor_admin/overblik/update_status`, data);
      return out;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('overblik');
      },
    }
  );

  useEffect(() => {
    const sorted = reverse(
      sortBy(
        data?.filter(
          (item) =>
            selectFilters.includes(item.color) && item.is_customer_service === isCustomerService
        ),
        [(item) => (item.status ? item.status : ''), (item) => item.flag]
      )
    );
    setMapdata(uniqBy(sorted, 'locid'));
  }, [selectFilters, isCustomerService, data]);

  const trelloMutate = useMutation(async (data) => {
    // const {data: out} = await apiClient.post(`/sensor_admin/overblik/make_jira`, data);
    const {data: out2} = await apiClient.post(`/sensor_admin/overblik/make_trello`, data);
    return out2;
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

  // const numNotifications = uniqBy(notifications, 'stationid')?.length;
  // const numBattery = notifications?.filter((item) => item.notification_id === 1).length;
  // const numLevel = notifications?.filter((item) => item.notification_id === 'Niveau spring').length;
  // const numAbnormal = notifications?.filter(
  //   (item) => item.notification_id === 'Abnormal hændelse'
  // ).length;
  // const numTilsyn = notifications?.filter((item) => [7, 8].includes(item.notification_id)).length;
  // const numPejling = notifications?.filter((item) => [5, 6].includes(item.notification_id)).length;

  const handleChange = (event) => {
    const {
      target: {value},
    } = event;
    setSelectFilters(typeof value === 'string' ? value.split(',') : value);
  };

  return (
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
            control={<Checkbox onChange={(e) => setIsCustomerService(e.target.checked)} />}
            label="Vis kundeservice"
          />
        </Box>
        <ServiceMap data={mapdata} isLoading={isLoading} setLassoFilter={setLassoFilter} />
      </Grid>
      <Grid item xs={12} md={6}>
        {/* <Typography variant="h6">
          Batteriskift: {numBattery} ud af {numNotifications}
        </Typography> */}
        {/* <Typography variant="h6">
          Niveau spring: {numLevel} ud af {numNotifications}
        </Typography>
        <Typography variant="h6">
          Abnormal hændelse: {numAbnormal} ud af {numNotifications}
        </Typography> */}
        {/* <Typography variant="h6">
          Tilsyn: {numTilsyn} ud af {numNotifications}
        </Typography>
        <Typography variant="h6">
          Pejling: {numPejling} ud af {numNotifications}
        </Typography> */}
        <NotificationTree
          notifications={notifications}
          statusMutate={statusMutate}
          trelloMutate={trelloMutate}
        />
      </Grid>
    </Grid>
  );
};

export default NotificationPage;
