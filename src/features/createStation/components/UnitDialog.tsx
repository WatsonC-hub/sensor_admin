import {
  Box,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid2,
  List,
  Typography,
} from '@mui/material';

import React, {useState} from 'react';

import Button from '~/components/Button';
import StamdataUnit from '~/features/station/components/stamdata/StamdataUnit';
import useUnitForm from '~/features/station/api/useUnitForm';
import {FormProvider} from 'react-hook-form';
import {Unit, useUnit} from '~/features/stamdata/api/useUnit';
type UnitDialogProps = {
  open: boolean;
  onClose: () => void;
  onAddUnitList: (units: Unit[]) => void;
};

const UnitDialog = ({open, onClose, onAddUnitList}: UnitDialogProps) => {
  const [selectedSensors, setSelectedSensors] = React.useState<Unit[]>([]);
  const [checkedSensors, setCheckedSensors] = useState<Unit[]>([]);

  const {
    get: {data: availableUnits},
  } = useUnit();

  const formMethods = useUnitForm<{calypso_id: string}>({
    mode: 'Add',
  });

  const handleCalypsoIdChange = (option: {id: string} | null) => {
    if (option == null) {
      setCheckedSensors([]);
      setSelectedSensors([]);
      return;
    }

    const sensors = availableUnits
      ?.filter((unit) => unit.calypso_id.toString() === option.id || unit.terminal_id === option.id)
      .sort((a, b) => a.signal_id - b.signal_id);
    setSelectedSensors(sensors || []);
    setCheckedSensors(sensors || []);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Tilføj tidsserier på baggrund af udstyr</DialogTitle>
        <DialogContent>
          <FormProvider {...formMethods}>
            <StamdataUnit tstype_id={undefined}>
              <Grid2 container>
                <StamdataUnit.CalypsoID onChangeCallback={handleCalypsoIdChange} />
              </Grid2>
            </StamdataUnit>
          </FormProvider>

          <Box>
            {selectedSensors.length > 0 && (
              <List>
                <Typography variant="subtitle1" sx={{mt: 2}}>
                  Tilgængelige tidsserier:
                </Typography>
                {selectedSensors.map((sensor) => (
                  <Box
                    key={sensor.unit_uuid}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checkedSensors.includes(sensor)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCheckedSensors((prev) => [...prev, sensor]);
                            } else {
                              setCheckedSensors((prev) =>
                                prev.filter((s) => s.unit_uuid !== sensor.unit_uuid)
                              );
                            }
                          }}
                        />
                      }
                      label={
                        <Typography>
                          {sensor.signal_id} - {sensor.sensor_id} ({sensor.sensortypename})
                        </Typography>
                      }
                    />
                  </Box>
                ))}
              </List>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button bttype="tertiary" onClick={handleClose}>
            Annuller
          </Button>
          <Button
            bttype="primary"
            disabled={checkedSensors.length === 0}
            onClick={() => {
              onAddUnitList(checkedSensors);
              handleClose();
            }}
          >
            Tilføj tidsserier
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UnitDialog;
