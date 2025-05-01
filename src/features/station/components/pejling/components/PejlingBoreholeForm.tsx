import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {LatestMeasurement, Maalepunkt} from '~/types';
import {PejlingBoreholeItem} from '../PejlingSchema';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import {Grid2} from '@mui/material';
import CompoundPejling from '../CompoundPejling';
import {useAtomValue} from 'jotai';
import {boreholeIsPumpAtom} from '~/state/atoms';
import {get} from 'lodash';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import WaterlevelAlert from '~/features/pejling/components/WaterlevelAlert';

type PejlingBoreholeFormProps = {
  setDynamic: (dynamic: Array<string | number> | undefined) => void;
  latestMeasurement: LatestMeasurement | undefined;
  openAddMP: () => void;
};

const PejlingBoreholeForm = ({
  setDynamic,
  latestMeasurement,
  openAddMP,
}: PejlingBoreholeFormProps) => {
  const isPump = useAtomValue(boreholeIsPumpAtom);
  const {
    watch,
    formState: {errors},
  } = useFormContext<PejlingBoreholeItem>();

  const timeofmeas = watch('timeofmeas');
  const measurement = watch('measurement');
  const notPossible = watch('notPossible');
  const service = watch('service');

  const pejlingOutOfRange = get(errors, 'timeofmeas')?.type == 'outOfRange';

  const {data: timeseries} = useTimeseriesData();
  const isWaterLevel = timeseries?.tstype_id === 1;
  const tstype_id = timeseries?.tstype_id;
  const [elevationDiff, setElevationDiff] = React.useState<number>(0);
  const [hide, setHide] = React.useState<boolean>(false);
  const [currentMP, setCurrentMP] = useState<Maalepunkt | null>(null);

  const {
    get: {data: mpData},
  } = useMaalepunkt();

  useEffect(() => {
    if (mpData !== undefined && mpData.length > 0) {
      const mp: Maalepunkt[] = mpData.filter((elem: Maalepunkt) => {
        if (
          moment(timeofmeas).isSameOrAfter(elem.startdate) &&
          moment(timeofmeas).isBefore(elem.enddate)
        ) {
          return true;
        }
      });
      const internalCurrentMP = mp.length > 0 ? mp[0] : null;
      setCurrentMP(internalCurrentMP);

      if (tstype_id) {
        if (internalCurrentMP) {
          const dynamicMeas = internalCurrentMP.elevation - Number(measurement);
          setDynamic([timeofmeas, dynamicMeas]);
          const latestmeas =
            latestMeasurement && latestMeasurement?.measurement ? latestMeasurement.measurement : 0;
          setElevationDiff(Math.abs(dynamicMeas - latestmeas));
          const diff = moment(timeofmeas).diff(moment(latestMeasurement?.timeofmeas), 'days');
          setHide(Math.abs(diff) > 1);
        } else {
          setDynamic([]);
          setHide(true);
        }
      }
    } else if (tstype_id !== 1) {
      const dynamicDate = timeofmeas;
      const dynamicMeas = Number(measurement);
      setDynamic([dynamicDate, dynamicMeas]);
      const latestmeas =
        latestMeasurement && latestMeasurement?.measurement ? latestMeasurement.measurement : 0;
      setElevationDiff(Math.abs(dynamicMeas - latestmeas));
    }
  }, [mpData, measurement, timeofmeas, tstype_id]);

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
          <CompoundPejling.NotPossible />
          <CompoundPejling.IsPump />
        </Grid2>
        {notPossible && <CompoundPejling.Extrema />}

        <Grid2 size={12} maxWidth={400}>
          <CompoundPejling.Measurement
            required={!notPossible}
            disabled={
              notPossible || currentMP?.elevation === undefined || currentMP?.elevation === null
            }
          />

          {isWaterLevel && !notPossible && (
            <WaterlevelAlert
              koteTitle={
                pejlingOutOfRange || currentMP == null ? '' : currentMP?.elevation.toString()
              }
              MPTitle={currentMP ? currentMP.mp_description : ' Ingen beskrivelse'}
              elevationDiff={elevationDiff}
              latestMeasurementSeverity={elevationDiff && elevationDiff > 0.03 ? 'warning' : 'info'}
              hide={hide}
              pejlingOutOfRange={pejlingOutOfRange || !currentMP}
            />
          )}
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
