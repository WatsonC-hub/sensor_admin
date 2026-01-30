import {Grid2} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import dayjs from 'dayjs';
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

type WatlevmpFormProps = {
  intakeno?: number;
  id: string;
  values: Watlevmp | undefined;
  setValues: (values: Watlevmp) => void;
};

type Watlevmp = {
  description: string;
  elevation: number;
};

const Form = createTypedForm<Watlevmp>();

const WatlevmpForm = ({id, intakeno, values, setValues}: WatlevmpFormProps) => {
  const [location_meta, registerSubmitter, removeSubmitter] = useCreateStationStore((state) => [
    state.formState.location?.meta,
    state.registerSubmitter,
    state.removeSubmitter,
  ]);
  const [helperText, setHelperText] = useState('');
  const {isMobile} = useBreakpoints();
  const {data: watlevmp} = useQuery({
    queryKey: queryKeys.Borehole.lastMP(location_meta?.boreholeno, intakeno),
    queryFn: async () => {
      const {data} = await apiClient.get<LastJupiterMPAPI>(
        `/sensor_field/borehole/last_mp/${location_meta?.boreholeno}/${intakeno}`
      );
      return {
        description: data.descriptio,
        elevation: data.elevation,
        startdate: dayjs(data.startdate),
      } as LastJupiterMPData;
    },
    enabled: !!location_meta?.boreholeno && intakeno !== undefined,
  });

  const watlevmpFormMethods = useWatlevmpForm<Watlevmp>({
    defaultValues: values,
    values: watlevmp,
  });

  const {watch, handleSubmit} = watlevmpFormMethods;

  const elevation = watch('elevation');

  useEffect(() => {
    registerSubmitter(id, async () => {
      let valid: boolean = false;
      await handleSubmit((values) => {
        setValues(values);
        valid = true;
      })();
      return valid;
    });

    return () => removeSubmitter(id);
  }, [handleSubmit]);

  useEffect(() => {
    if (elevation === watlevmp?.elevation && watlevmp?.elevation !== undefined) {
      setHelperText(`${watlevmp?.startdate.isValid() ? 'Målepunkt' : 'Terrænkote'} fra Jupiter`);
    }
  }, [elevation, intakeno]);

  return (
    <Form formMethods={watlevmpFormMethods} gridSizes={isMobile ? 12 : 6}>
      <Form.Input
        name="elevation"
        label="Målepunktskote"
        required
        type="number"
        onChangeCallback={(value) => {
          if (watlevmp?.elevation !== undefined) {
            if (value !== watlevmp.elevation) {
              setHelperText('');
            } else {
              setHelperText('Målepuntsværdi eller terrænkote er hentet fra Jupiter');
            }
          }
        }}
        helperText={helperText}
      />
      <Grid2 size={isMobile ? 12 : 6}>
        <Form.Controller
          name="description"
          gridProps={{sx: {pt: 1}}}
          render={({field, fieldState: {error}}) => (
            <MPDescription
              {...field}
              slots={{
                textfield: {
                  error: !!error,
                  required: true,
                  helperText: error?.message,
                },
              }}
            />
          )}
        />
      </Grid2>
    </Form>
  );
};

export default WatlevmpForm;
