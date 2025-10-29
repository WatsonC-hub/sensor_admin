import {Box, Typography} from '@mui/material';
import React from 'react';
import {useFormContext} from 'react-hook-form';
import Button from '~/components/Button';
import AddUnitForm from '~/features/stamdata/components/stamdata/AddUnitForm';
import UnitForm from '~/features/stamdata/components/stamdata/UnitForm';
import {AddUnit} from '../../schema';

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

const Unit = () => {
  const [udstyrDialogOpen, setUdstyrDialogOpen] = React.useState(false);
  const {
    getValues,
    formState: {errors},
  } = useFormContext<AddUnit>();
  const {tstype_id} = React.useContext(UnitContext);
  return (
    <>
      <Box sx={{display: 'flex', alignItems: 'baseline', justifyContent: 'start'}}>
        <Button
          disabled={tstype_id === -1}
          bttype="primary"
          size="small"
          sx={{ml: 1}}
          onClick={() => setUdstyrDialogOpen(true)}
        >
          {getValues('unit_uuid') === '' ? 'Tilføj Udstyr' : 'Ændre udstyr'}
        </Button>
        {Object.keys(errors).length > 0 && (
          <Typography variant="caption" color="error" ml={1}>
            Vælg udstyr først eller sørg for at rette fejl i formularen
          </Typography>
        )}
      </Box>
      <UnitForm mode="normal" />
      <AddUnitForm
        mode="add"
        udstyrDialogOpen={udstyrDialogOpen}
        setUdstyrDialogOpen={setUdstyrDialogOpen}
        tstype_id={tstype_id}
      />
    </>
  );
};

StamdataUnit.Unit = Unit;

export default StamdataUnit;
