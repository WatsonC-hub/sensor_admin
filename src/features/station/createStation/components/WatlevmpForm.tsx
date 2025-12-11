import {Grid2} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import dayjs from 'dayjs';
import React, {useEffect, useState} from 'react';
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
import useBreakpoints from '~/hooks/useBreakpoints';

type WatlevmpFormProps = {
  tstype_id: number;
  intakeno?: number;
};

const WatlevmpForm = ({tstype_id, intakeno}: WatlevmpFormProps) => {
  const {isMobile} = useBreakpoints();
  const size = isMobile ? 12 : 5.5;
  const [helperText, setHelperText] = useState('');
  const {meta, setFormErrors} = useCreateStationContext();

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
    defaultValues: undefined,
  });

  const {
    // handleSubmit: handleWatlevmpSubmit,
    // reset: resetWatlevmp,
    formState: watlevmpFormState,
    watch,
  } = watlevmpFormMethods;

  const elevation = watch('elevation');

  useEffect(() => {
    if (elevation !== watlevmp?.elevation) {
      setHelperText('');
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
    <Grid2 container size={size} spacing={1} marginBottom={2}>
      <FormProvider {...watlevmpFormMethods}>
        <StamdataWatlevmp tstype_id={tstype_id}>
          <DefaultWatlevmpForm
            helperText={helperText}
            slotProps={{
              elevation: {
                onChangeCallback: (value) => {
                  if (watlevmp?.elevation !== undefined) {
                    if (value !== watlevmp.elevation) {
                      setHelperText(
                        `Advarsel: Elevationen afviger fra den sidste målte grundvandsstand på ${watlevmp.elevation} m.u.h.`
                      );
                    } else {
                      setHelperText('');
                    }
                  }
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
