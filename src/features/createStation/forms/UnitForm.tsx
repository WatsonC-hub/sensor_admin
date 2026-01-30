import {Box, Grid2} from '@mui/material';
import React, {useEffect} from 'react';
import {FormProvider} from 'react-hook-form';
import useUnitForm from '~/features/station/api/useUnitForm';
import StamdataUnit from '~/features/station/components/stamdata/StamdataUnit';
import dayjs from 'dayjs';
import {z} from 'zod';
import {zodDayjs} from '~/helpers/schemas';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useCreateStationStore} from '../state/useCreateStationStore';

type Props = {
  id: string;
  setValues: (values: AddUnitType) => void;
  tstype_id: number;
  unit: AddUnitType | undefined;
};

const addSchema = z.object({
  startdate: zodDayjs().default(dayjs()),
  unit_uuid: z.string({required_error: 'Udstyrs UUID er påkrævet'}),
  calypso_id: z.string().optional(),
});

export type AddUnitType = z.infer<typeof addSchema>;

const UnitForm = ({id, setValues, unit, tstype_id}: Props) => {
  const {isMobile} = useBreakpoints();
  const [removeSubmitter, registerSubmitter] = useCreateStationStore((state) => [
    state.removeSubmitter,
    state.registerSubmitter,
  ]);
  const unitFormMethods = useUnitForm<AddUnitType>({
    schema: addSchema,
    values: unit,
  });

  const {handleSubmit} = unitFormMethods;

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

  return (
    <FormProvider {...unitFormMethods}>
      <StamdataUnit tstype_id={tstype_id}>
        <Grid2 container size={12} spacing={1} direction={isMobile ? 'column-reverse' : 'row'}>
          <Grid2 size={isMobile ? 12 : 4}>
            <Box display="flex" alignItems="center" height="100%" gap={1}>
              <StamdataUnit.CalypsoID required />
            </Box>
          </Grid2>
          <Grid2 size={isMobile ? 12 : 4}>
            <StamdataUnit.SensorID required />
          </Grid2>
          <Grid2 size={isMobile ? 12 : 4}>
            <StamdataUnit.StartDate required />
          </Grid2>
        </Grid2>
      </StamdataUnit>
    </FormProvider>
  );
};

export default UnitForm;
