import {Save} from '@mui/icons-material';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2,
  List,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import React, {useState} from 'react';
import {FormProvider} from 'react-hook-form';
import {toast} from 'react-toastify';
import {z} from 'zod';
import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import {useUser} from '~/features/auth/useUser';
import {TypeUnitPost, Unit, useUnit} from '~/features/stamdata/api/useUnit';
import useUnitForm from '~/features/station/api/useUnitForm';
import StamdataUnit from '~/features/station/components/stamdata/StamdataUnit';
import {zodDayjs} from '~/helpers/schemas';
import {useLocationData} from '~/hooks/query/useMetadata';
import {useAppContext} from '~/state/contexts';

type AddUnitsDialogProps = {
  open: boolean;
  onClose: () => void;
};

const unitSchema = z.object({
  calypso_id: z.string({required_error: 'Calypso ID er påkrævet'}),
  startdate: zodDayjs('Startdato er påkrævet').default(dayjs()),
});

type UnitType = z.infer<typeof unitSchema>;
type CalypsoIdOption = {calypso_id: string};

const AddUnitsDialog = ({open, onClose}: AddUnitsDialogProps) => {
  const {loc_id} = useAppContext(['loc_id']);
  const {data: location_data} = useLocationData(loc_id);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedSensors, setSelectedSensors] = React.useState<Unit[]>([]);
  const [invoiceData, setInvoiceData] = useState<{
    terminal_id: string;
    amount: number;
    subscription_type: string;
  } | null>(null);
  const [timeseriesSelections, setTimeseriesSelections] = useState<Record<number, TypeUnitPost>>(
    {}
  );

  const filteredTimeseries = location_data?.timeseries.filter(
    (ts) => !ts.unit_uuid && !ts.calculated
  );
  const matchingSensorTimeseries = filteredTimeseries?.filter((ts) =>
    selectedSensors.some((sensor) => sensor.sensortypeid === ts.tstype_id)
  );
  const singleSensorTimeseries = matchingSensorTimeseries?.length === 1;
  const hasPrefix = filteredTimeseries?.some((ts) => ts.prefix !== null && ts.prefix !== '');
  const tstype_ids = [...new Set(filteredTimeseries?.map((ts) => ts.tstype_id))];
  const {
    get: {data: availableUnits},
    postBatch: {mutate: postUnitBatch, isPending: isPostingUnits},
  } = useUnit();

  const {superUser} = useUser();

  const formMethods = useUnitForm<UnitType>({
    schema: unitSchema,
    mode: 'Add',
    defaultValues: {calypso_id: undefined, startdate: dayjs()},
  });

  const {
    handleSubmit,
    getValues,
    formState: {errors, isDirty},
  } = formMethods;

  const handleCalypsoIdChange = (option: CalypsoIdOption | null) => {
    if (option == null) {
      setSelectedSensors([]);
      return;
    }

    const sensors = availableUnits
      ?.filter(
        (unit) =>
          unit.calypso_id.toString() === option.calypso_id || unit.terminal_id === option.calypso_id
      )
      .sort((a, b) => a.signal_id - b.signal_id);

    if (!sensors) return;
    setSelectedSensors(sensors);

    const initialSelections: Record<number, TypeUnitPost> = {};

    const timeseriesCount = filteredTimeseries?.reduce(
      (acc, ts) => {
        acc[ts.tstype_id] = (acc[ts.tstype_id] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    );

    const availableTimeseries = filteredTimeseries?.filter(
      (ts) => timeseriesCount?.[ts.tstype_id] === 1
    );

    availableTimeseries?.forEach((ts) => {
      const singleTimeseries =
        availableTimeseries?.filter((t) => t.tstype_id === ts.tstype_id).length === 1;

      const filteredSensors = sensors.filter((sensor) => sensor.sensortypeid === ts.tstype_id);
      const singleSensor = filteredSensors.length === 1;

      if (singleSensor && singleTimeseries) {
        initialSelections[ts.ts_id] = filteredSensors.map(
          (sensor) =>
            ({
              unit_uuid: sensor.unit_uuid,
              startdate: dayjs(),
            }) as TypeUnitPost
        )[0];
      }
    });

    setTimeseriesSelections(initialSelections);
  };

  const handleClose = () => {
    onClose();
  };

  const checkInheritInvoice = async (ts_ids: Array<number>, terminal_id: string) => {
    const {data} = await apiClient.get(
      `/sensor_field/stamdata/check-invoices/${terminal_id}?${ts_ids.map((id) => `ts_id=${id}`).join('&')}`
    );

    if (data?.ignoreInvoice) {
      if (data?.message) toast.warning(data?.message);
      submit(getValues(), false);
      return;
    }

    setInvoiceData(data);
    setInvoiceDialogOpen(true);
  };

  const submit = (data: UnitType, inheritInvoice: boolean) => {
    postUnitBatch({
      data: {
        startdate: data.startdate,
        inherit_invoice: inheritInvoice,
        units: timeseriesSelections,
      },
    });
    handleClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="xs">
        <DialogTitle>Tilføj udstyr</DialogTitle>
        <DialogContent>
          <FormProvider {...formMethods}>
            <StamdataUnit tstype_id={tstype_ids}>
              <Grid2 container>
                <StamdataUnit.CalypsoID onChangeCallback={handleCalypsoIdChange} />
                <StamdataUnit.StartDate required />
              </Grid2>
            </StamdataUnit>
          </FormProvider>

          <Box>
            {matchingSensorTimeseries && matchingSensorTimeseries.length > 0 && (
              <List>
                <Typography variant="subtitle1" sx={{mt: 2}}>
                  Tilgængelige tidsserier:
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  {matchingSensorTimeseries?.map((timeseries) => {
                    return (
                      <Box key={timeseries.ts_id} display="flex" alignItems="center" gap={1}>
                        <Box
                          display="flex"
                          alignItems="center"
                          width={hasPrefix ? '25%' : singleSensorTimeseries ? 'auto' : '23%'}
                        >
                          <Typography textAlign={hasPrefix ? 'right' : 'left'} flexGrow={1}>
                            {timeseries.prefix
                              ? `${timeseries.prefix} - ${timeseries.tstype_name}`
                              : timeseries.tstype_name}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1} flexGrow={1}>
                          <Select
                            fullWidth
                            size="small"
                            value={timeseriesSelections[timeseries.ts_id]?.unit_uuid || ''}
                            onChange={(e) => {
                              const selectedUnit = selectedSensors.find(
                                (sensor) => sensor.unit_uuid === e.target.value
                              );
                              if (selectedUnit) {
                                const unitPost: TypeUnitPost = {
                                  unit_uuid: selectedUnit.unit_uuid,
                                  startdate: dayjs(),
                                  enddate: dayjs('2099-01-01'),
                                };
                                setTimeseriesSelections((prev) => ({
                                  ...prev,
                                  [timeseries.ts_id]: unitPost,
                                }));
                              }
                            }}
                          >
                            {selectedSensors
                              .filter((sensor) => sensor.sensortypeid === timeseries.tstype_id)
                              .map((sensor) => (
                                <MenuItem key={sensor.unit_uuid} value={sensor.unit_uuid}>
                                  {`${sensor.signal_id} - ${sensor.sensor_id}`}
                                </MenuItem>
                              ))}
                          </Select>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
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
            startIcon={isPostingUnits ? undefined : <Save />}
            loading={isPostingUnits}
            disabled={!isDirty || Object.keys(errors).length > 0 || isPostingUnits}
            onClick={handleSubmit(async () => {
              if (superUser)
                await checkInheritInvoice(
                  Object.keys(timeseriesSelections).map((id) => parseInt(id)),
                  selectedSensors[0].terminal_id
                );

              if (!superUser) {
                submit(getValues(), false);
              }
            })}
          >
            Tilføj udstyr
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={invoiceDialogOpen} onClose={() => setInvoiceDialogOpen(false)}>
        <DialogContent>
          <Typography>Følgende faktureringsinformation findes på tidligere enhed</Typography>
          <Typography>
            <strong>Terminal:</strong> {invoiceData?.terminal_id}
          </Typography>
          <Typography>
            <strong>Pris pr måned:</strong> {invoiceData?.amount}
          </Typography>
          <Typography>
            <strong>Subscription type:</strong> {invoiceData?.subscription_type}
          </Typography>
          <Typography>Vil du overføre fakturering til den nye enhed?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInvoiceDialogOpen(false)} bttype="tertiary">
            Annuller
          </Button>
          <Button
            onClick={() => submit(getValues(), false)}
            bttype="tertiary"
            loading={isPostingUnits}
          >
            Nej
          </Button>
          <Button
            onClick={() => submit(getValues(), true)}
            bttype="primary"
            loading={isPostingUnits}
          >
            Ja
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddUnitsDialog;
