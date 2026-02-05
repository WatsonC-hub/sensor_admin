import {Box, Grid2} from '@mui/material';
import React from 'react';
import {FormProvider} from 'react-hook-form';
import useUnitForm from '~/features/station/api/useUnitForm';
import StamdataUnit from '~/features/station/components/stamdata/StamdataUnit';
import dayjs from 'dayjs';
import {z} from 'zod';
import {zodDayjs} from '~/helpers/schemas';
import Button from '~/components/Button';

type Props = {
  onClose: () => void;
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

const UnitForm = ({setValues, unit, tstype_id, onClose}: Props) => {
  const unitFormMethods = useUnitForm<AddUnitType>({
    schema: addSchema,
    values: unit,
  });

  const {handleSubmit} = unitFormMethods;

  return (
    <FormProvider {...unitFormMethods}>
      <StamdataUnit tstype_id={tstype_id}>
        <Grid2 container size={12} spacing={1} direction={'column'}>
          <Grid2 size={12}>
            <Box display="flex" alignItems="center" height="100%" gap={1}>
              <StamdataUnit.CalypsoID required />
            </Box>
          </Grid2>
          <Grid2 size={12}>
            <StamdataUnit.SensorID required />
          </Grid2>
          <Grid2 size={12}>
            <StamdataUnit.StartDate required />
          </Grid2>
          <Grid2 display={'flex'} flexDirection={'row'} justifyContent="flex-end" size={12} gap={1}>
            <Button
              bttype="tertiary"
              onClick={() => {
                onClose();
              }}
            >
              Annuller
            </Button>
            <Button
              bttype="primary"
              onClick={() => {
                handleSubmit((values) => {
                  setValues(values);
                })();
              }}
            >
              Tilføj udstyr
            </Button>
          </Grid2>
        </Grid2>
      </StamdataUnit>
    </FormProvider>
  );
};

export default UnitForm;
