import moment from 'moment';
import React from 'react';
import {useFormContext} from 'react-hook-form';
import {PejlingBoreholeItem} from '../PejlingSchema';
import {Grid2} from '@mui/material';
import CompoundPejling from '../CompoundPejling';
import {useAtomValue} from 'jotai';
import {boreholeIsPumpAtom} from '~/state/atoms';

const PejlingBoreholeForm = () => {
  const isPump = useAtomValue(boreholeIsPumpAtom);
  const {watch} = useFormContext<PejlingBoreholeItem>();

  const timeofmeas = watch('timeofmeas');
  const notPossible = watch('notPossible');
  const service = watch('service');

  return (
    <Layout>
      <Grid2
        container
        display={'flex'}
        size={12}
        flexDirection={'column'}
        alignItems={'center'}
        alignContent={'center'}
        justifyContent={'center'}
        spacing={2}
      >
        <Grid2
          container
          size={12}
          display={'flex'}
          flexDirection={'row'}
          alignContent={'center'}
          justifyContent={'center'}
        >
          <CompoundPejling.NotPossible />
          <CompoundPejling.IsPump />
        </Grid2>
        {notPossible && <CompoundPejling.Extrema />}

        <Grid2 size={12} maxWidth={400}>
          <CompoundPejling.Measurement />
          <CompoundPejling.WaterlevelAlert />
        </Grid2>
        <Grid2 container spacing={1} size={12} mb={2} display={'flex'} flexDirection={'row'}>
          <CompoundPejling.TimeOfMeas
            sx={{mb: 0, maxWidth: isPump ? 200 : undefined}}
            label="Tidspunkt for pejling"
          />
          {isPump && (
            <>
              <CompoundPejling.Service />
              <CompoundPejling.PumpStop
                disabled={service}
                slotProps={{
                  htmlInput: {
                    max: moment(timeofmeas).format('YYYY-MM-DDTHH:mm:ss'),
                  },
                }}
                sx={{maxWidth: 200}}
              />
            </>
          )}
        </Grid2>
        <CompoundPejling.Correction />
        <CompoundPejling.Comment />
      </Grid2>
    </Layout>
  );
};

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({children}: LayoutProps) => {
  return children;
};

export default PejlingBoreholeForm;
