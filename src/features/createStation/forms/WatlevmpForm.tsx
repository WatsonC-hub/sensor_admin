import {Grid2} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import dayjs, {Dayjs} from 'dayjs';
import React, {useEffect, useState} from 'react';
import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {
  LastJupiterMPAPI,
  LastJupiterMPData,
} from '~/pages/field/boreholeno/components/LastJupiterMP';
import useWatlevmpForm from '~/features/station/api/useWatlevmpForm';
import {createTypedForm} from '~/components/formComponents/Form';
import MPDescription from '~/features/station/components/stamdata/MPDescription';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useCreateStationStore} from '../state/useCreateStationStore';
import Button from '~/components/Button';
import {RadioButtonCheckedOutlined, RadioButtonUncheckedOutlined} from '@mui/icons-material';
import {button_sx} from '../common_style';

type EmptyObject = Record<string, never>;

type WatlevmpFormProps = {
  intakeno?: number;
  id: string;
  values: Watlevmp | undefined;
  setValues: (values: ValidateWatlevmp | EmptyObject) => void;
};

type Watlevmp = {
  description: string;
  elevation: number | null;
  startdate?: Dayjs;
};

type ValidateWatlevmp = {
  description: string;
  elevation: number;
  startdate?: Dayjs;
};

const Form = createTypedForm<Watlevmp>();

const WatlevmpForm = ({id, intakeno, values, setValues}: WatlevmpFormProps) => {
  const [location_meta, registerSubmitter, removeSubmitter, deleteState] = useCreateStationStore(
    (state) => [
      state.formState.location?.meta,
      state.registerSubmitter,
      state.removeSubmitter,
      state.deleteState,
    ]
  );

  const [helperText, setHelperText] = useState('');
  const {isMobile} = useBreakpoints();

  const {data: watlevmp} = useQuery({
    queryKey: queryKeys.Borehole.lastMP(location_meta?.boreholeno, intakeno),
    queryFn: async () => {
      const {data} = await apiClient.get<LastJupiterMPAPI>(
        `/sensor_field/borehole/last_mp/${location_meta?.boreholeno}/${intakeno}`
      );
      return {
        description: data.descriptio || 'Terrænkote',
        elevation: data.elevation,
        startdate: dayjs(data.startdate),
      } as LastJupiterMPData;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !!location_meta?.boreholeno && intakeno !== undefined,
  });

  const watlevmpFormMethods = useWatlevmpForm<Watlevmp, ValidateWatlevmp>({
    defaultValues: values,
  });

  const {watch, handleSubmit, reset} = watlevmpFormMethods;

  const elevation = watch('elevation');
  const description = watch('description');

  useEffect(() => {
    if (values !== undefined) onChangeCallback();

    return () => removeSubmitter(id);
  }, [handleSubmit]);

  useEffect(() => {
    if (watlevmp !== undefined && values !== undefined) {
      if (Object.keys(values).length === 0) {
        reset({
          elevation: watlevmp.elevation,
          description: watlevmp.description,
          ...(watlevmp.startdate ? {startdate: watlevmp.startdate} : {}),
        });
        onChangeCallback();
      } else {
        if (watlevmp.elevation === values.elevation && watlevmp.description === values.description)
          reset((prev) => ({
            ...prev,
            ...(watlevmp.startdate ? {startdate: watlevmp.startdate} : {}),
          }));
        onChangeCallback();
      }
      if (elevation === watlevmp.elevation && description === watlevmp.description) {
        setHelperText(`Målepunkt er hentet fra Jupiter`);
      } else {
        setHelperText('');
      }
    }
  }, [watlevmp, intakeno]);

  const onChangeCallback = () => {
    setValues({});
    registerSubmitter(id, async () => {
      let valid: boolean = false;
      await handleSubmit((values) => {
        if (
          values.description !== watlevmp?.description ||
          values.elevation !== watlevmp?.elevation
        )
          delete values.startdate;
        setValues(values);
        valid = true;
      })();
      return valid;
    });
  };

  return (
    <Form formMethods={watlevmpFormMethods} gridSizes={isMobile ? 12 : 3}>
      <Form.Input
        name="elevation"
        label="Målepunktskote"
        required={values !== undefined}
        fullWidth
        disabled={values === undefined}
        type="number"
        onChangeCallback={(value) => {
          if (watlevmp?.elevation !== undefined) {
            if (value !== watlevmp.elevation && description === watlevmp.description) {
              setHelperText('');
            } else {
              setHelperText('Målepunkt er hentet fra Jupiter');
            }
          }

          onChangeCallback();
        }}
        helperText={helperText}
      />
      <Form.Controller
        name="description"
        gridProps={{sx: {pt: 1}}}
        gridSizes={isMobile ? 12 : 6}
        render={({field, fieldState: {error}}) => (
          <MPDescription
            {...field}
            disabled={values === undefined}
            slots={{
              textfield: {
                error: !!error,
                required: values !== undefined,
                helperText: error?.message,
              },
            }}
            onChangeCallback={(value) => {
              if (watlevmp?.description !== undefined) {
                if (value !== watlevmp.description && elevation === watlevmp.elevation) {
                  setHelperText('');
                } else {
                  setHelperText('Målepunkt er hentet fra Jupiter');
                }

                if (value === watlevmp.description && elevation === watlevmp.elevation) {
                  reset((prev) => ({
                    ...prev,
                    ...(watlevmp.startdate ? {startdate: watlevmp.startdate} : {}),
                  }));
                }
              }

              onChangeCallback();
            }}
          />
        )}
      />
      <Grid2
        size={isMobile ? 12 : 2.5}
        alignContent={'center'}
        display="flex"
        justifyContent={isMobile ? 'end' : 'start'}
      >
        <Button
          bttype="primary"
          startIcon={
            values === undefined ? <RadioButtonCheckedOutlined /> : <RadioButtonUncheckedOutlined />
          }
          sx={{
            ...button_sx(values === undefined),
            alignSelf: 'center',
          }}
          onClick={() => {
            if (values === undefined) {
              onChangeCallback();
            } else {
              deleteState(id as `timeseries.${string}.watlevmp`);
              reset({
                elevation: null,
                description: '',
              });
              removeSubmitter(id);
              setHelperText('');
            }
          }}
        >
          Registrer senere
        </Button>
      </Grid2>
    </Form>
  );
};

export default WatlevmpForm;
