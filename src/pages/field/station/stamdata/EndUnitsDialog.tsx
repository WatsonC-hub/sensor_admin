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

import React, {useEffect, useState} from 'react';

import Button from '~/components/Button';
import StamdataUnit from '~/features/station/components/stamdata/StamdataUnit';
import useUnitForm from '~/features/station/api/useUnitForm';
import {FormProvider} from 'react-hook-form';
import dayjs, {Dayjs} from 'dayjs';
import {useLocationData} from '~/hooks/query/useMetadata';
import {useMutation, useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';
import {toast} from 'react-toastify';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {useAppContext} from '~/state/contexts';
import {UnitHistory, UseUnitHistory2} from '~/features/stamdata/api/useUnitHistory';
import FormInput from '~/components/FormInput';
import {useUser} from '~/features/auth/useUser';
import {z} from 'zod';
import {zodDayjs} from '~/helpers/schemas';

type UnitDialogProps = {
  open: boolean;
  onClose: () => void;
};

type ChangeReason = {id: number; reason: string; default_actions: string | null};

type Action = {action: string; label: string};

type UnitEnd = {
  ts_id: number;
  gid: number;
  startdate: Dayjs;
};

type UnitEndPayload = {
  enddate: Dayjs;
  change_reason?: number;
  action?: string;
  comment?: string;
  units: Array<UnitEnd>;
};

const baseSchema = z.object({
  enddate: zodDayjs('Slutdato er påkrævet'),
  change_reason: z.number().optional(),
  action: z.string().optional(),
  comment: z.string().optional(),
});

const superUserSchema = baseSchema.extend({
  change_reason: z.number({required_error: 'Vælg årsag'}),
  action: z.string({required_error: 'Vælg handling'}),
});

const EndUnitsDialog = ({open, onClose}: UnitDialogProps) => {
  const {ts_id} = useAppContext(['ts_id']);
  const {data: location_data} = useLocationData();
  const {superUser} = useUser();

  const {data: unit_history} = UseUnitHistory2(ts_id);
  const activeTimeseries = location_data?.timeseries.filter(
    (ts) => dayjs(ts.slutdato).isAfter(dayjs()) && unit_history?.some((uh) => uh.ts_id === ts.ts_id)
  );
  const [checkedSensors, setCheckedSensors] = useState<UnitHistory[]>([]);

  const tstype_ids = activeTimeseries?.map((ts) => ts.tstype_id);

  const {data: changeReasons} = useQuery<ChangeReason[]>({
    queryKey: queryKeys.changeReasons(),
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/stamdata/change-reasons`);
      return data;
    },
    enabled: superUser,
    staleTime: 1000 * 60 * 60,
  });

  const {data: actions} = useQuery<Action[]>({
    queryKey: queryKeys.actions(unit_history?.[0].uuid),
    queryFn: async () => {
      const {data} = await apiClient.get(
        `/sensor_field/stamdata/unit-actions/${unit_history?.[0].uuid}`
      );
      return data;
    },
    enabled: superUser && unit_history !== undefined && !!unit_history[0]?.uuid,
    staleTime: 1000 * 60 * 60,
  });

  const {mutateAsync: takeHomeMutation} = useMutation({
    mutationFn: async (payload: UnitEndPayload) => {
      const {data} = await apiClient.post(`/sensor_field/stamdata/end_unit_history_batch`, payload);
      return data;
    },
    onSuccess: () => {
      handleClose();
      toast.success('Udstyret er hjemtaget');
    },
    meta: {
      invalidates: [queryKeys.Timeseries.unitHistory2()],
    },
  });

  useEffect(() => {
    if (unit_history && unit_history.length > 0) {
      const initialCheckedSensors = unit_history.filter((sensor) =>
        activeTimeseries?.some((ts) => ts.ts_id === sensor.ts_id)
      );
      setCheckedSensors(initialCheckedSensors);
    }
  }, [unit_history]);

  const formMethods = useUnitForm<Omit<UnitEndPayload, 'units'>>({
    schema: superUser ? superUserSchema : baseSchema,
    mode: 'Add',
    defaultValues: {
      enddate: dayjs(),
      change_reason: undefined,
      action: undefined,
      comment: '',
    },
  });

  const {
    handleSubmit,
    setValue,
    formState: {errors},
  } = formMethods;

  const handleClose = () => {
    setCheckedSensors([]);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Tilføj tidsserier på baggrund af udstyr</DialogTitle>
        <DialogContent>
          <FormProvider {...formMethods}>
            <StamdataUnit tstype_id={tstype_ids}>
              <Grid2 container>
                <StamdataUnit.EndDate required />
              </Grid2>
            </StamdataUnit>

            {superUser && (
              <Box display="flex" flexDirection="column" gap={1}>
                <FormInput
                  name="change_reason"
                  fullWidth
                  select
                  label="Årsag"
                  options={changeReasons?.map((reason) => ({[reason.id]: reason.reason}))}
                  keyType="number"
                  placeholder="Vælg årsag"
                  onChangeCallback={(e) => {
                    const reason = changeReasons?.find(
                      (reason) =>
                        reason.id ===
                        Number((e as React.ChangeEvent<HTMLInputElement>).target.value)
                    );
                    if (reason) {
                      if (reason.default_actions?.includes('CLOSE')) {
                        const action = actions?.find((action) => action.action.includes('CLOSE'));
                        if (action) {
                          setValue('action', action.action);
                        }
                      } else {
                        setValue('action', reason.default_actions ?? 'DO_NOTHING');
                      }
                    }
                  }}
                />

                <FormInput
                  name="action"
                  fullWidth
                  select
                  label="Handling"
                  placeholder="Handling"
                  options={actions?.map((action) => ({[action.action]: action.label}))}
                />

                <FormInput
                  name="comment"
                  label="Kommentar"
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Skriv en kommentar"
                />
              </Box>
            )}
          </FormProvider>
          <Box>
            {checkedSensors && checkedSensors.length > 0 && (
              <List>
                <Typography variant="subtitle1" sx={{mt: 2}}>
                  Tilgængelige tidsserier:
                </Typography>
                {unit_history?.map((sensor) => (
                  <Box
                    key={sensor.uuid}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checkedSensors.some((s) => s.uuid === sensor.uuid)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCheckedSensors((prev) => [...prev, sensor]);
                            } else {
                              setCheckedSensors((prev) =>
                                prev.filter((s) => s.uuid !== sensor.uuid)
                              );
                            }
                          }}
                        />
                      }
                      label={
                        <Typography>
                          {sensor.signal_id} - {sensor.sensor_id} (
                          {activeTimeseries?.find((ts) => ts.ts_id === sensor.ts_id)?.ts_name})
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
            disabled={checkedSensors.length === 0 || Object.keys(errors).length > 0}
            onClick={handleSubmit(async (data) => {
              await takeHomeMutation({
                enddate: data.enddate,
                change_reason: data.change_reason,
                action: data.action,
                comment: data.comment,
                units: checkedSensors.map((sensor) => ({
                  ts_id: sensor.ts_id,
                  gid: sensor.gid,
                  startdate: dayjs(sensor.startdato),
                })),
              });
            })}
          >
            Hjemtag udstyr
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EndUnitsDialog;
