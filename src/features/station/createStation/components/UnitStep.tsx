import dayjs from 'dayjs';
import React, {useEffect} from 'react';
import {FormProvider} from 'react-hook-form';
import useUnitForm from '../../api/useUnitForm';
import StamdataUnit from '../../components/stamdata/StamdataUnit';
import {z} from 'zod';
import {zodDayjs} from '~/helpers/schemas';
import {Box, Grid2, IconButton, Typography} from '@mui/material';
import useBreakpoints from '~/hooks/useBreakpoints';
import useCreateStationContext from '../api/useCreateStationContext';
import {RemoveCircleOutline} from '@mui/icons-material';
import {UnitData} from '~/helpers/CreateStationContextProvider';
import FormFieldset from '~/components/formComponents/FormFieldset';
import Button from '~/components/Button';

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
    <FormFieldset
      label={
        isMobile ? (
          <Button
            bttype="borderless"
            sx={{p: 0, m: 0}}
            startIcon={<RemoveCircleOutline color="primary" />}
            onClick={() => {
              onValidate('units', units?.filter((u) => u.unit_uuid !== unit.unit_uuid) || []);
            }}
          >
            <Typography variant="body2" color="grey.700">
              Udstyr
            </Typography>
          </Button>
        ) : (
          'Udstyr'
        )
      }
      labelPosition={isMobile ? -22 : -20}
      sx={{width: '100%', p: 1}}
    >
      <FormProvider {...unitFormMethods}>
        <Box display="flex" flexDirection="row" gap={1} alignItems="center">
          {!isMobile && (
            <IconButton
              color="primary"
              size="small"
              onClick={() => {
                onValidate('units', units?.filter((u) => u.unit_uuid !== unit.unit_uuid) || []);
              }}
            >
              <RemoveCircleOutline />
            </IconButton>
          )}
          <StamdataUnit tstype_id={unit.sensortypeid}>
            <Grid2 container size={12} spacing={1} direction={isMobile ? 'column-reverse' : 'row'}>
              <Grid2 size={isMobile ? 12 : 4}>
                <StamdataUnit.CalypsoID />
              </Grid2>
              <Grid2 size={isMobile ? 12 : 4}>
                <StamdataUnit.SensorID />
              </Grid2>
              <Grid2 size={isMobile ? 12 : 4}>
                <StamdataUnit.StartDate />
              </Grid2>
            </Grid2>
          </StamdataUnit>
        </Box>
      </FormProvider>
    </FormFieldset>
  );
};

export default UnitStep;
