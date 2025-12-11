import {Box, Typography} from '@mui/material';
import React from 'react';
import {useFormContext} from 'react-hook-form';
import Button from '~/components/Button';
import AddUnitForm from '~/features/stamdata/components/stamdata/AddUnitForm';
import UnitForm from '~/features/stamdata/components/stamdata/UnitForm';
import {EditAddUnit} from '../../schema';

type StamdataUnitProps = {
  children: React.ReactNode;
  tstype_id: number | undefined;
};

type UnitContextType = {
  tstype_id: number | undefined;
};

const UnitContext = React.createContext<UnitContextType>({
  tstype_id: undefined,
});

const StamdataUnit = ({children, tstype_id}: StamdataUnitProps) => {
  return <UnitContext.Provider value={{tstype_id}}>{children}</UnitContext.Provider>;
};

type UnitProps = {
  onValidate?: (sensortypeList: Array<number>) => void;
};

const Unit = ({onValidate}: UnitProps) => {
  const [udstyrDialogOpen, setUdstyrDialogOpen] = React.useState(false);
  const {
    getValues,
    formState: {errors},
  } = useFormContext<EditAddUnit>();
  const {tstype_id} = React.useContext(UnitContext);
  return (
    <>
      <Box sx={{display: 'flex', alignItems: 'baseline', justifyContent: 'start'}}>
        <Button
          bttype="primary"
          size="small"
          sx={{ml: 1}}
          onClick={() => setUdstyrDialogOpen(true)}
        >
          {getValues('unit_uuid') === '' || getValues('unit_uuid')?.length === 0
            ? 'Tilføj Udstyr'
            : 'Ændre udstyr'}
        </Button>
        {Object.keys(errors).length > 0 && (
          <Typography variant="caption" color="error" ml={1}>
            Vælg udstyr først eller sørg for at rette fejl i formularen
          </Typography>
        )}
      </Box>
      <UnitForm mode="normal" tstype_id={tstype_id} />
      <AddUnitForm
        mode="add"
        udstyrDialogOpen={udstyrDialogOpen}
        setUdstyrDialogOpen={setUdstyrDialogOpen}
        tstype_id={tstype_id}
        onValidate={onValidate}
      />
    </>
  );
};

StamdataUnit.Unit = Unit;

export default StamdataUnit;
