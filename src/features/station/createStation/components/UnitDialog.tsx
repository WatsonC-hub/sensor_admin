import {
  Box,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  List,
  Typography,
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

import React, {useState} from 'react';
import ExtendedAutocomplete from '~/components/Autocomplete';
import {Unit, useUnit} from '~/features/stamdata/api/useAddUnit';
import CaptureDialog from '~/components/CaptureDialog';
import {toast} from 'react-toastify';
import Button from '~/components/Button';

type UnitDialogProps = {
  open: boolean;
  onClose: () => void;
  onAddUnitList: (units: Unit[]) => void;
};

const UnitDialog = ({open, onClose, onAddUnitList}: UnitDialogProps) => {
  const [selectedUnit, setSelectedUnit] = React.useState<Unit | null>(null);
  const [selectedSensors, setSelectedSensors] = React.useState<Unit[]>([]);
  const [checkedSensors, setCheckedSensors] = useState<Unit[]>([]);
  const [openCaptureDialog, setOpenCaptureDialog] = useState(false);
  const {
    get: {data: availableUnits},
  } = useUnit();

  const uniqueUnitsByCalypsoId = () => {
    const uniqueMap: {[key: string]: Unit} = {};
    availableUnits?.forEach((unit) => {
      if (!uniqueMap[unit.calypso_id.toString()]) {
        uniqueMap[unit.calypso_id.toString()] = unit;
      }
    });
    return Object.values(uniqueMap);
  };

  const sensorsForCalyspoId = (id: string | number) =>
    availableUnits?.filter(
      (unit) => unit.calypso_id.toString() === id.toString() || unit.terminal_id === id
    );

  const handleCalypsoIdChange = (option: Unit | null) => {
    if (!option) {
      setSelectedUnit(null);
      setSelectedSensors([]);
      return;
    }

    setSelectedUnit(option);

    const sensors = sensorsForCalyspoId(option.calypso_id);

    setSelectedSensors(sensors || []);
    setCheckedSensors(sensors || []);
  };

  const handleClose = () => {
    onClose();
    setSelectedSensors([]);
    setCheckedSensors([]);
    setSelectedUnit(null);
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Tilføj tidsserier på baggrund af udstyr</DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <ExtendedAutocomplete<Unit, false>
              id="unit_uuid"
              labelKey="calypso_id"
              textFieldsProps={{label: 'Calypso ID', placeholder: 'Søg Calypso ID'}}
              isOptionEqualToValue={(option, value) => option.unit_uuid === value.unit_uuid}
              options={uniqueUnitsByCalypsoId() || []}
              selectValue={selectedUnit}
              onChange={handleCalypsoIdChange}
              renderOption={(props, option) => {
                return (
                  <li {...props} key={option.unit_uuid}>
                    <Typography>{option.calypso_id}</Typography>
                  </li>
                );
              }}
            />
            <IconButton onClick={() => setOpenCaptureDialog(true)} size="large">
              <QrCodeScannerIcon />
            </IconButton>
          </Box>

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
                          {sensor.channel} - {sensor.sensor_id} ({sensor.sensortypename})
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
              if (selectedUnit === null) return;
              onAddUnitList(checkedSensors);
              handleClose();
            }}
          >
            Tilføj tidsserier
          </Button>
        </DialogActions>
      </Dialog>
      {openCaptureDialog && (
        <CaptureDialog
          open={openCaptureDialog}
          handleClose={() => setOpenCaptureDialog(false)}
          handleScan={(data: any, calypso_id: number | null) => {
            if (calypso_id === null) {
              toast.error('Ugyldigt Calypso ID');
              setOpenCaptureDialog(false);
              return;
            }

            if (
              !uniqueUnitsByCalypsoId()?.some(
                (unit) => unit.calypso_id.toString() === calypso_id.toString()
              )
            ) {
              toast.error(`Ingen tilgængelige enheder med Calypso ID: ${calypso_id}`);
              setOpenCaptureDialog(false);
              return;
            }

            handleCalypsoIdChange(
              uniqueUnitsByCalypsoId()?.find((unit) => unit.calypso_id === calypso_id) || null
            );
            setOpenCaptureDialog(false);
          }}
        />
      )}
    </>
  );
};

export default UnitDialog;
