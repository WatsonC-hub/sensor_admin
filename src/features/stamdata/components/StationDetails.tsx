import {Grid} from '@mui/material';
import React from 'react';
import {Controller, useFormContext} from 'react-hook-form';

import useBreakpoints from '~/hooks/useBreakpoints';
import {authStore} from '~/state/store';

import Autocomplete from './multiselect/Autocomplete';
import TransferList from './multiselect/TransferList';

type Props = {
  mode: string;
  disable: boolean;
};

const StationDetails = ({mode, disable}: Props) => {
  const {control, getValues} = useFormContext();

  const {isMobile} = useBreakpoints();
  const superUser = authStore().superUser;

  //   watch('stationDetails.ressourcer');

  console.log(getValues());
  return (
    <Grid container spacing={2} alignItems={'center'}>
      {superUser && mode === 'normal' && (
        <Grid item xs={12} sm={12}>
          <Controller
            name="stationDetails.ressourcer"
            control={control}
            disabled={disable}
            render={
              !isMobile
                ? ({field: {onChange, value, onBlur}}) =>
                    value && <TransferList value={value} setValue={onChange} onBlur={onBlur} />
                : ({field: {onChange, value, onBlur}}) =>
                    value && <Autocomplete value={value} setValue={onChange} onBlur={onBlur} />
            }
          />
        </Grid>
      )}
    </Grid>
  );
};

export default StationDetails;
