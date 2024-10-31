import SaveIcon from '@mui/icons-material/Save';
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  InputAdornment,
  Tooltip,
  Typography,
} from '@mui/material';
import moment from 'moment';
import React, {ChangeEvent, ReactNode, useEffect, useState} from 'react';
import {useFormContext, get} from 'react-hook-form';

import Button from '~/components/Button';
import FormInput from '~/components/FormInput';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import {stamdataStore} from '~/state/store';
import {LatestMeasurement, Maalepunkt, PejlingItem} from '~/types';

import Correction from './Correction';
import IngenMPAlert from './IngenMPAlert';
import WaterlevelAlert from './WaterlevelAlert';
// TODO
// - Find ud af om textfield skal have grøn outline

interface PejlingFormProps {
  submit: (data: any) => void;
  resetFormData: () => void;
  openAddMP: () => void;
  setDynamic: (dynamic: Array<string | number>) => void;
  latestMeasurement: LatestMeasurement | undefined;
}

export default function PejlingForm({
  submit,
  resetFormData,
  openAddMP,
  setDynamic,
  latestMeasurement,
}: PejlingFormProps) {
  const store = stamdataStore();
  const tstype_id = store.timeseries.tstype_id;
  const isWaterlevel = tstype_id === 1;
  const isFlow = tstype_id === 2;

  const {
    get: {data: mpData},
  } = useMaalepunkt();

  const {
    watch,
    getValues,
    setError,
    clearErrors,
    setValue,
    handleSubmit,
    formState: {errors},
  } = useFormContext<PejlingItem>();

  const [currentMP, setCurrentMP] = useState<Maalepunkt | null>(null);

  const [notPossible, setNotPossible] = useState(false);
  const [stationUnit] = stamdataStore((state) => [state.timeseries.unit]);
  const measurement = watch('measurement');
  const date = watch('timeofmeas');
  const [elevationDiff, setElevationDiff] = useState<number>();
  const [hide, setHide] = useState<boolean>(false);

  useEffect(() => {
    if (mpData !== undefined && mpData.length > 0) {
      const mp: Maalepunkt[] = mpData.filter((elem: Maalepunkt) => {
        if (
          moment(getValues('timeofmeas')).isSameOrAfter(elem.startdate) &&
          moment(getValues('timeofmeas')).isBefore(elem.enddate)
        ) {
          return true;
        }
      });
      const internalCurrentMP = mp.length > 0 ? mp[0] : null;
      setCurrentMP(internalCurrentMP);

      if (tstype_id) {
        if (internalCurrentMP) {
          const dynamicDate = date;
          const dynamicMeas = internalCurrentMP.elevation - Number(measurement);
          setDynamic([dynamicDate, dynamicMeas]);
          const latestmeas =
            latestMeasurement && latestMeasurement?.measurement ? latestMeasurement.measurement : 0;
          setElevationDiff(Math.abs(dynamicMeas - latestmeas));
          const diff = moment(dynamicDate).diff(moment(latestMeasurement?.timeofmeas), 'days');
          setHide(Math.abs(diff) > 1);
        } else {
          setDynamic([]);
          setHide(true);
        }
      }
    } else if (tstype_id !== 1) {
      const dynamicDate = getValues('timeofmeas');
      const dynamicMeas = Number(measurement);
      setDynamic([dynamicDate, dynamicMeas]);
      const latestmeas =
        latestMeasurement && latestMeasurement?.measurement ? latestMeasurement.measurement : 0;
      setElevationDiff(Math.abs(dynamicMeas - latestmeas));
    }
  }, [mpData, measurement, date, tstype_id]);

  const handleDateChange = (date: string) => {
    if (isWaterlevel && mpData !== undefined) {
      const mp = mpData.filter((elem) => {
        if (moment(date).isSameOrAfter(elem.startdate) && moment(date).isBefore(elem.enddate)) {
          return true;
        }
      });
      if (mp.length > 0) {
        setCurrentMP(mp[0]);
        clearErrors('timeofmeas');
      } else {
        setError('timeofmeas', {
          type: 'outOfRange',
          message: 'Tidspunkt er uden for et målepunkt',
        });
      }
    }
  };

  const handleNotPossibleChange = () => {
    setNotPossible(!notPossible);
    setValue('measurement', 0);
  };

  const pejlingOutOfRange = get(errors, 'timeofmeas')?.type == 'outOfRange';

  if (isWaterlevel && mpData !== undefined && mpData.length < 1) {
    return <IngenMPAlert openAddMP={openAddMP} />;
  }

  return (
    <Layout title={getValues('gid') !== -1 ? 'Opdater kontrol' : 'Indberet kontrol'}>
      <Grid container spacing={3} alignItems="center" justifyContent="center">
        <Grid item xs={12} sm={12}>
          <Tooltip title="f.eks. tør eller tilfrossen">
            <FormControlLabel
              control={<Checkbox sx={{color: 'primary.main'}} onChange={handleNotPossibleChange} />}
              label="Måling ikke mulig"
            />
          </Tooltip>
        </Grid>
        <Grid item xs={12} sm={7}>
          <FormInput
            type="number"
            name="measurement"
            rules={{required: true}}
            label={
              <Typography variant="h5" component="h3">
                {isWaterlevel ? 'Pejling (nedstik)' : 'Måling'}
              </Typography>
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">{isWaterlevel ? 'm' : stationUnit}</InputAdornment>
              ),
            }}
            fullWidth
            disabled={notPossible || (isWaterlevel && currentMP == null)}
          />
        </Grid>
        {isWaterlevel && (
          <WaterlevelAlert
            latestMeasurementSeverity={
              (elevationDiff && elevationDiff > 0.1) || !latestMeasurement ? 'warning' : 'info'
            }
            hide={hide}
            MPTitle={currentMP ? currentMP.mp_description : ' Ingen beskrivelse'}
            koteTitle={pejlingOutOfRange || currentMP == null ? '' : currentMP.elevation}
            elevationDiff={elevationDiff}
            pejlingOutOfRange={pejlingOutOfRange || !currentMP}
          />
        )}

        <Grid item xs={12} sm={7}>
          <FormInput
            name="timeofmeas"
            label="Dato"
            fullWidth
            type="datetime-local"
            required
            sx={{
              mb: 2,
            }}
            onChangeCallback={(e) =>
              handleDateChange((e as ChangeEvent<HTMLTextAreaElement>).target.value)
            }
          />
        </Grid>

        {(isWaterlevel || isFlow) && <Correction />}

        <Grid item xs={12} sm={12}>
          <FormInput
            name="comment"
            label="Kommentar"
            required
            fullWidth
            multiline
            rows={4}
            sx={{
              mb: 2,
            }}
          />
        </Grid>
        <Actions
          onSave={handleSubmit(submit)}
          onCancel={() => {
            resetFormData();
            setDynamic([]);
          }}
          disabled={
            pejlingOutOfRange ||
            (isWaterlevel && currentMP === null) ||
            getValues('useforcorrection').toString() == '-1'
          }
        />
      </Grid>
    </Layout>
  );
}

interface LayoutProps {
  children: ReactNode;
  title: string;
}

const Layout = ({children, title}: LayoutProps) => {
  return (
    <Card
      style={{marginBottom: 25}}
      sx={{
        marginLeft: {xs: '0%'},
        textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        alignSelf: 'center',
      }}
    >
      <CardContent>
        <Typography gutterBottom variant="h5" component="h2">
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
};

interface ActionsProps {
  onSave: () => void;
  onCancel: () => void;
  disabled: boolean;
}

const Actions = ({onSave, onCancel, disabled}: ActionsProps) => {
  return (
    <Grid item xs={12} sm={6}>
      <Box display="flex" gap={1} justifyContent={{xs: 'flex-end', sm: 'center'}}>
        <Button bttype="tertiary" onClick={onCancel}>
          Annuller
        </Button>
        <Button bttype="primary" onClick={onSave} disabled={disabled} startIcon={<SaveIcon />}>
          Gem
        </Button>
      </Box>
    </Grid>
  );
};
