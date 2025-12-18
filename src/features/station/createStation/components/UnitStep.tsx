import dayjs from 'dayjs';
import React, {useEffect} from 'react';
import {FormProvider} from 'react-hook-form';
import useUnitForm from '../../api/useUnitForm';
import StamdataUnit from '../../components/stamdata/StamdataUnit';
import {z} from 'zod';
import {zodDayjs} from '~/helpers/schemas';
import {Grid2} from '@mui/material';
import useBreakpoints from '~/hooks/useBreakpoints';
import Button from '~/components/Button';
import useCreateStationContext from '../api/useCreateStationContext';
import {Delete} from '@mui/icons-material';
import {UnitData} from '~/helpers/CreateStationContextProvider';

type UnitStepProps = {
  unit: UnitData;
};

const addSchema = z.object({
  startdate: zodDayjs().default(dayjs()),
  unit_uuid: z.string({required_error: 'Udstyrs UUID er påkrævet'}),
  calypso_id: z.string().optional(),
  sensor_id: z.string().optional(),
});

type AddUnitForm = z.infer<typeof addSchema>;

const UnitStep = ({unit}: UnitStepProps) => {
  const {isMobile} = useBreakpoints();
  const {
    formState: {units},
    onValidate,
  } = useCreateStationContext();
  const unitFormMethods = useUnitForm<AddUnitForm>({
    schema: addSchema,
    mode: 'Add',
    defaultValues: {
      startdate: dayjs(),
      unit_uuid: '',
      calypso_id: '',
      sensor_id: '',
    },
  });

  useEffect(() => {
    unitFormMethods.reset({
      startdate: dayjs(unit.startdate),
      unit_uuid: unit.unit_uuid,
      calypso_id: unit.calypso_id?.toString(),
      sensor_id: unit.sensor_id,
    });
  }, [unit]);

  return (
    <FormProvider {...unitFormMethods}>
      <StamdataUnit tstype_id={unit.sensortypeid}>
        <Grid2
          container
          size={12}
          spacing={1}
          alignItems="center"
          display={isMobile ? 'flex' : undefined}
          justifyContent={isMobile ? 'end' : undefined}
        >
          <Grid2 size={isMobile ? 12 : 6}>
            <StamdataUnit.CalypsoID />
          </Grid2>
          <Grid2 size={isMobile ? 12 : 6}>
            <StamdataUnit.SensorID />
          </Grid2>
          <Grid2 size={isMobile ? 12 : 6}>
            <StamdataUnit.StartDate />
          </Grid2>
          <Button
            bttype="tertiary"
            startIcon={<Delete />}
            onClick={() => {
              onValidate('units', units?.filter((u) => u.unit_uuid !== unit.unit_uuid) || []);
            }}
          >
            Fjern udstyr
          </Button>
        </Grid2>
      </StamdataUnit>
    </FormProvider>
  );
};

export default UnitStep;
