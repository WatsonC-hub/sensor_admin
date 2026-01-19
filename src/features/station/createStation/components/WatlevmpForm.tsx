import {Grid2} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import dayjs from 'dayjs';
import React, {ChangeEvent, useEffect, useState} from 'react';
import {FormProvider} from 'react-hook-form';
import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {
  LastJupiterMPAPI,
  LastJupiterMPData,
} from '~/pages/field/boreholeno/components/LastJupiterMP';
import useWatlevmpForm from '../../api/useWatlevmpForm';
import DefaultWatlevmpForm from '../../components/stamdata/stamdataComponents/DefaultWatlevmpForm';
import StamdataWatlevmp from '../../components/stamdata/StamdataWatlevmp';
import useCreateStationContext from '../api/useCreateStationContext';
import {Watlevmp} from '../../schema';

type WatlevmpFormProps = {
  index: number;
  tstype_id: number;
  intakeno?: number;
  onValidate: (key: 'watlevmp', data: Array<Watlevmp>) => void;
};

const WatlevmpForm = ({index, tstype_id, intakeno, onValidate}: WatlevmpFormProps) => {
  const [helperText, setHelperText] = useState('');
  const {
    meta,
    setFormErrors,
    formState: {watlevmp: watlevContext},
  } = useCreateStationContext();

  const {data: watlevmp} = useQuery({
    queryKey: queryKeys.Borehole.lastMP(meta?.boreholeno, intakeno),
    queryFn: async () => {
      const {data} = await apiClient.get<LastJupiterMPAPI>(
        `/sensor_field/borehole/last_mp/${meta?.boreholeno}/${intakeno}`
      );
      return {
        descriptio: data.descriptio,
        elevation: data.elevation,
        startdate: dayjs(data.startdate),
      } as LastJupiterMPData;
    },
    enabled: !!meta?.boreholeno && intakeno !== undefined && tstype_id === 1,
  });

  const watlevmpFormMethods = useWatlevmpForm({
    defaultValues: watlevContext?.[index],
    values: watlevmp,
  });

  const {formState: watlevmpFormState, watch} = watlevmpFormMethods;

  const elevation = watch('elevation');

  useEffect(() => {
    if (elevation === watlevmp?.elevation && watlevmp?.elevation !== undefined) {
      setHelperText(`${watlevmp.startdate.isValid() ? 'Målepunkt' : 'Terrænkote'} fra Jupiter`);
    }
  }, [elevation, intakeno]);

  useEffect(() => {
    const watlevmpInvalid = Object.keys(watlevmpFormState.errors).length > 0;
    setFormErrors((prev) => ({
      ...prev,
      timeseries: watlevmpInvalid,
    }));
  }, [watlevmpFormState.errors]);

  return (
    <Grid2 container size={12} spacing={1}>
      <FormProvider {...watlevmpFormMethods}>
        <StamdataWatlevmp tstype_id={tstype_id}>
          <DefaultWatlevmpForm
            helperText={helperText}
            slotProps={{
              elevation: {
                onChangeCallback: (value) => {
                  if (watlevmp?.elevation !== undefined) {
                    if (value !== watlevmp.elevation) {
                      setHelperText('');
                    } else {
                      setHelperText('Målepuntsværdi eller terrænkote er hentet fra Jupiter');
                    }
                  }
                  const updatedWatlevmp = [...(watlevContext || [])];
                  updatedWatlevmp[index] = {...updatedWatlevmp[index], elevation: value as number};
                  onValidate('watlevmp', updatedWatlevmp);
                },
              },
              description: {
                onChangeCallback: (value) => {
                  const updatedWatlevmp = [...(watlevContext || [])];
                  updatedWatlevmp[index] = {
                    ...updatedWatlevmp[index],
                    description: (value as ChangeEvent<HTMLInputElement>).target.value,
                  };
                  onValidate('watlevmp', updatedWatlevmp);
                },
              },
            }}
          />
        </StamdataWatlevmp>
      </FormProvider>
    </Grid2>
  );
};

export default WatlevmpForm;
