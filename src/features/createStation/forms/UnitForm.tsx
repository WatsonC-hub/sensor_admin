import {Grid2} from '@mui/material';
import React, {useEffect} from 'react';
import {FormProvider} from 'react-hook-form';
import AddUnitForm from '~/features/stamdata/components/stamdata/AddUnitForm';
import useUnitForm from '~/features/station/api/useUnitForm';
import StamdataUnit from '~/features/station/components/stamdata/StamdataUnit';
import dayjs from 'dayjs';
import {z} from 'zod';
import {zodDayjs} from '~/helpers/schemas';
import useBreakpoints from '~/hooks/useBreakpoints';

type Props = {
  setIsUnitSelected: React.Dispatch<React.SetStateAction<boolean>>;
  tstype_id: number;
  onValidChange: (isValid: boolean, value?: AddUnitType) => void;
  registerSlice: (id: string, required: boolean, validate: () => Promise<boolean>) => void;
  openUnitDialog: boolean;
  setOpenUnitDialog: React.Dispatch<React.SetStateAction<boolean>>;
  unit: AddUnitType | undefined;
};

const addSchema = z.object({
  startdate: zodDayjs().default(dayjs()),
  unit_uuid: z.string({required_error: 'Udstyrs UUID er påkrævet'}),
  calypso_id: z.string().optional(),
  sensor_id: z.string().optional(),
});

export type AddUnitType = z.infer<typeof addSchema>;

const UnitForm = ({
  setIsUnitSelected,
  tstype_id,
  onValidChange,
  registerSlice,
  openUnitDialog,
  setOpenUnitDialog,
  unit,
}: Props) => {
  const {isMobile} = useBreakpoints();
  const unitFormMethods = useUnitForm<AddUnitType>({
    schema: addSchema,
    mode: 'Add',
    defaultValues: {
      startdate: dayjs(),
      unit_uuid: '',
      calypso_id: '',
      sensor_id: '',
    },
    values: unit,
  });

  const {
    getValues,
    trigger,
    formState: {isValid, isValidating},
  } = unitFormMethods;

  useEffect(() => {
    registerSlice('unit', true, async () => {
      const isValid = await trigger();
      return isValid;
    });
  }, []);

  useEffect(() => {
    if (!isValidating) {
      const values = getValues();
      onValidChange(isValid, values);
    }
  }, [isValidating, isValid]);

  return (
    <FormProvider {...unitFormMethods}>
      <StamdataUnit tstype_id={tstype_id}>
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
      {openUnitDialog && (
        <AddUnitForm
          mode="add"
          udstyrDialogOpen={openUnitDialog}
          tstype_id={tstype_id}
          setUdstyrDialogOpen={setOpenUnitDialog}
          onValidChange={(isValid, value) => {
            onValidChange(isValid, value);
            setIsUnitSelected(value?.unit_uuid ? true : false);
          }}
        />
      )}
    </FormProvider>
  );
};

export default UnitForm;
