import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {Maalepunkt} from '~/types';
import {PejlingBoreholeItem} from '../PejlingSchema';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import {Alert, Typography, Grid2} from '@mui/material';
import CompoundPejling from '../CompoundPejling';
import {useAtomValue} from 'jotai';
import {boreholeIsPumpAtom} from '~/state/atoms';

type PejlingBoreholeFormProps = {
  openAddMP: () => void;
};

const PejlingBoreholeForm = ({openAddMP}: PejlingBoreholeFormProps) => {
  const isPump = useAtomValue(boreholeIsPumpAtom);
  const {getValues, setValue, setError, clearErrors} = useFormContext<PejlingBoreholeItem>();

  const timeofmeas = getValues('timeofmeas');
  const notPossible = getValues('notPossible');
  const service = getValues('service');

  const [pejlingOutOfRange, setPejlingOutOfRange] = useState(false);
  const [currentMP, setCurrentMP] = useState<{elevation: number | null; mp_description: string}>({
    elevation: null,
    mp_description: '',
  });

  const {
    get: {data: mpData},
  } = useMaalepunkt();

  useEffect(() => {
    if (mpData && mpData.length > 0) {
      const mp: Array<Maalepunkt> = mpData.filter((elem) => {
        if (
          moment(timeofmeas).isSameOrAfter(elem.startdate) &&
          moment(timeofmeas).isBefore(elem.enddate)
        ) {
          return true;
        }
      });
      console.log('mp', mp);
      if (mp.length > 0) {
        setPejlingOutOfRange(false);
        setCurrentMP({elevation: mp?.[0].elevation, mp_description: mp?.[0].mp_description});
      } else {
        setPejlingOutOfRange(true);
      }
    }
  }, [mpData]);

  const handleDateChange = (date: string) => {
    const mp = mpData?.filter((elem) => {
      if (moment(date).isSameOrAfter(elem.startdate) && moment(date).isBefore(elem.enddate)) {
        return true;
      }
    });

    console.log('mp', mp);
    if (mp && mp.length > 0) {
      clearErrors('timeofmeas');
      setPejlingOutOfRange(false);
      setCurrentMP(mp[0]);
    } else {
      console.log('currentMP', currentMP);
      setError('timeofmeas', {type: 'outOfRange', message: 'Tidspunkt er uden for et målepunkt'});
      setPejlingOutOfRange(true);
    }
  };

  if (mpData && mpData.length === 0) {
    return (
      <Layout>
        <CompoundPejling.MPAlert openAddMP={openAddMP} />
      </Layout>
    );
  }

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
          <CompoundPejling.NotPossible
            onChangeCallback={() => setValue('disttowatertable_m', null)}
          />
          <CompoundPejling.IsPump />
        </Grid2>
        {notPossible && <CompoundPejling.Extrema />}

        <Grid2 size={12} maxWidth={400}>
          <CompoundPejling.DistToWaterTable
            required={!notPossible}
            disabled={
              notPossible || currentMP.elevation === undefined || currentMP.elevation === null
            }
          />
          <Alert
            severity="info"
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography variant="body2">
              Målepunkt:{' '}
              {currentMP.mp_description ? currentMP.mp_description : ' Ingen beskrivelse'}
            </Typography>
            <Typography variant="body2">
              Kote: {pejlingOutOfRange ? '' : `${currentMP.elevation} m`}
            </Typography>
          </Alert>
        </Grid2>
        <Grid2 container spacing={1} size={12} mb={2} display={'flex'} flexDirection={'row'}>
          <CompoundPejling.TimeOfMeas
            sx={{mb: 0, maxWidth: isPump ? 200 : undefined}}
            label="Tidspunkt for pejling"
            onChangeCallback={(e) =>
              handleDateChange(
                (e as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>).target.value
              )
            }
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
