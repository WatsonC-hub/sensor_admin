import {Grid2} from '@mui/material';
import React from 'react';
import StamdataTimeseries from '../StamdataTimeseries';
import {FormInputProps} from '~/components/FormInput';
import {BoreholeAddTimeseries} from '~/features/station/schema';

type Props = {
  size: number;
  required?: boolean;
  formPrefix?: string;
  slotProps?: {
    TypeSelect?: Omit<FormInputProps<BoreholeAddTimeseries>, 'name'>;
    intakeno?: Omit<FormInputProps<BoreholeAddTimeseries>, 'name'>;
  };
};

const BoreholeTimeseriesForm = ({size, required, slotProps, formPrefix}: Props) => {
  return (
    <>
      <Grid2 size={size}>
        <StamdataTimeseries.Intakeno {...slotProps?.intakeno} formPrefix={formPrefix} />
      </Grid2>
      <Grid2 size={size}>
        <StamdataTimeseries.TypeSelect
          required={required}
          {...slotProps?.TypeSelect}
          formPrefix={formPrefix}
        />
      </Grid2>
      {/* <Grid2 size={size}>
        <StamdataTimeseries.SensorDepth />
      </Grid2> */}
    </>
  );
};

export default BoreholeTimeseriesForm;
