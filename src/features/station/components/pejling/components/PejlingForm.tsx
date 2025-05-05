import React, {useEffect} from 'react';
import CompoundPejling from '../CompoundPejling';
import moment from 'moment';
import {LatestMeasurement, Maalepunkt} from '~/types';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import {PejlingItem} from '../PejlingSchema';
import {get, useFormContext} from 'react-hook-form';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import WaterlevelAlert from '~/features/pejling/components/WaterlevelAlert';

type PejlingFormProps = {
  setDynamic: (dynamic: Array<string | number> | undefined) => void;
  latestMeasurement: LatestMeasurement | undefined;
  openAddMP: () => void;
};

const PejlingForm = ({setDynamic, latestMeasurement, openAddMP}: PejlingFormProps) => {
  const {
    watch,
    formState: {errors},
  } = useFormContext<PejlingItem>();

  const pejlingOutOfRange = get(errors, 'timeofmeas')?.type == 'outOfRange';
  const timeofmeas = watch('timeofmeas');
  const measurement = watch('measurement');
  const notPossible = watch('notPossible');
  const {data: timeseries} = useTimeseriesData();
  const isWaterLevel = timeseries?.tstype_id === 1;

  const {
    get: {data: mpData},
  } = useMaalepunkt();

  const [elevationDiff, setElevationDiff] = React.useState<number>(0);
  const [hide, setHide] = React.useState<boolean>(false);
  const [currentMP, setCurrentMP] = React.useState<Maalepunkt | null>(null);
  const tstype_id = timeseries?.tstype_id;

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
      const dynamicMeas = Number(measurement);
      setDynamic([timeofmeas, dynamicMeas]);
      const latestmeas =
        latestMeasurement && latestMeasurement?.measurement ? latestMeasurement.measurement : 0;
      setElevationDiff(Math.abs(dynamicMeas - latestmeas));
    }
  }, [mpData, measurement, timeofmeas, tstype_id]);

  if (isWaterLevel && mpData !== undefined && mpData.length < 1)
    return <CompoundPejling.MPAlert openAddMP={openAddMP} />;

  return (
    <div>
      <CompoundPejling.NotPossible />
      <br />
      <CompoundPejling.Measurement
        sx={{maxWidth: 400}}
        rules={{required: !notPossible}}
        disabled={notPossible || (isWaterLevel && pejlingOutOfRange)}
      />

      {isWaterLevel && !notPossible && (
        <WaterlevelAlert
          koteTitle={pejlingOutOfRange || currentMP == null ? '' : currentMP.elevation.toString()}
          MPTitle={currentMP ? currentMP.mp_description : ' Ingen beskrivelse'}
          elevationDiff={elevationDiff}
          latestMeasurementSeverity={
            (elevationDiff && elevationDiff > 0.03) || !latestMeasurement ? 'warning' : 'info'
          }
          hide={hide}
          pejlingOutOfRange={pejlingOutOfRange || !currentMP}
        />
      )}

      <CompoundPejling.TimeOfMeas sx={{maxWidth: 400}} />
      <br />
      {isWaterLevel && <CompoundPejling.Correction sx={{maxWidth: 400}} />}
      <CompoundPejling.Comment sx={{maxWidth: 800}} />
    </div>
  );
};

export default PejlingForm;
