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
import useCreateStationContext from '../api/useCreateStationContext';
import {createTypedForm} from '~/components/formComponents/Form';
import MPDescription from '~/features/station/components/stamdata/MPDescription';
import useBreakpoints from '~/hooks/useBreakpoints';
import {TimeseriesController} from '../controller/types';
import {useCreateStationStore} from '../state/useCreateStationStore';

type WatlevmpFormProps = {
  tstype_id: number;
  intakeno?: number;
  onValidChange: (isValid: boolean, value?: Watlevmp) => void;
  index: number;
};

type Watlevmp = {
  description: string;
  elevation: number;
};

const Form = createTypedForm<Watlevmp>();

const WatlevmpForm = ({tstype_id, intakeno, onValidChangem, index}: WatlevmpFormProps) => {
  const {formState, setState, registerSubmitter, removeSubmitter} = useCreateStationStore(
    (state) => state
  );

  const [helperText, setHelperText] = useState('');
  const {meta} = useCreateStationContext();
  const {isMobile} = useBreakpoints();
  const {data: watlevmp} = useQuery({
    queryKey: queryKeys.Borehole.lastMP(meta?.boreholeno, intakeno),
    queryFn: async () => {
      const {data} = await apiClient.get<LastJupiterMPAPI>(
        `/sensor_field/borehole/last_mp/${meta?.boreholeno}/${intakeno}`
      );
      return {
        description: data.descriptio,
        elevation: data.elevation,
        startdate: dayjs(data.startdate),
      } as LastJupiterMPData;
    },
    enabled: !!meta?.boreholeno && intakeno !== undefined && tstype_id === 1,
  });

  const watlevmpFormMethods = useWatlevmpForm<Watlevmp>({
    defaultValues: formState.timeseries?.[index].watlevmp,
    values: watlevmp,
  });

  const {
    watch,
    getValues,
    trigger,
    formState: {isValid, isValidating},
    handleSubmit,
  } = watlevmpFormMethods;

  const elevation = watch('elevation');

  useEffect(() => {
    registerSubmitter(`timeseries.${index}.watlevmp`, async () => {
      let valid: boolean = false;
      await handleSubmit(
        (values) => {
          setState(`timeseries.${index}.watlevmp`, values);
          valid = true;
        },
        (errors) => console.log('errors', errors)
      )();
      return valid;
    });

    return () => removeSubmitter(`timeseries.${index}.watlevmp`);
  }, [handleSubmit]);

  // useEffect(() => {
  //   controller.registerSlice('watlevmp', true, async () => {
  //     const isValid = await trigger();
  //     return isValid;
  //   });
  // }, []);

  // useEffect(() => {
  //   if (!isValidating) {
  //     const values = getValues();
  //     onValidChange(isValid, values);
  //   }
  // }, [isValid, isValidating]);

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
