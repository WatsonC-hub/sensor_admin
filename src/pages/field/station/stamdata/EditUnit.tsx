import SaveIcon from '@mui/icons-material/Save';
import {Box} from '@mui/material';
import {useMutation} from '@tanstack/react-query';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {FormProvider} from 'react-hook-form';
import {toast} from 'react-toastify';
import {z} from 'zod';

import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import {useUnitHistory} from '~/features/stamdata/api/useUnitHistory';
import UnitForm from '~/features/stamdata/components/stamdata/UnitForm';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import {queryClient} from '~/queryClient';
import {useAppContext} from '~/state/contexts';
import StationPageBoxLayout from '~/features/station/components/StationPageBoxLayout';
import UdstyrReplace from './UdstyrReplace';
import usePermissions from '~/features/permissions/api/usePermissions';
import FabWrapper from '~/components/FabWrapper';
import {BuildRounded} from '@mui/icons-material';
import AddUnitForm from '~/features/stamdata/components/stamdata/AddUnitForm';
import UnitEndDateDialog from './UnitEndDialog';
import useUnitForm from '~/features/station/api/useUnitForm';
import {EditUnit as EditUnitType, editUnitSchema} from '~/features/station/schema';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {invalidateFromMeta} from '~/helpers/InvalidationHelper';

const onMutateUnit = (ts_id: number, loc_id: number) => {
  return {
    meta: {
      invalidates: [
        queryKeys.Timeseries.availableUnits(ts_id),
        queryKeys.Location.timeseries(loc_id),
        queryKeys.Timeseries.metadata(ts_id),
        queryKeys.Map.all(),
      ],
    },
  };
};

const EditUnit = () => {
  const {ts_id, loc_id} = useAppContext(['loc_id', 'ts_id']);
  const {data: metadata} = useTimeseriesData();
  const {data: unit_history} = useUnitHistory();
  const [selectedUnit, setSelectedUnit] = useState<number | ''>(unit_history?.[0]?.gid ?? '');
  const [openDialog, setOpenDialog] = useState(false);
  const [openAddUdstyr, setOpenAddUdstyr] = useState(false);

  const {location_permissions} = usePermissions(loc_id);
  const tstype_id = metadata?.tstype_id;
  const disabled = location_permissions !== 'edit';

  const mode =
    unit_history && unit_history.length > 0 && moment(unit_history?.[0].slutdato) > moment();
  const fabText = mode ? 'Hjemtag udstyr' : 'Tilføj udstyr';

  const metadataEditUnitMutation = useMutation({
    mutationFn: async (data: any) => {
      const {data: out} = await apiClient.put(`/sensor_field/stamdata/update_unit/${ts_id}`, data);
      return out;
    },
    onMutate: async () => onMutateUnit(ts_id, loc_id),
    onSuccess: (data, variables, context) => {
      invalidateFromMeta(queryClient, context.meta);
      toast.success('Udstyr er opdateret');
    },
  });

  const unit = unit_history?.find((item) => item.gid == selectedUnit);

  const {data: defaultValues} = editUnitSchema.safeParse({
    unit_uuid: unit?.uuid,
    startdate: moment(unit?.startdato).format('YYYY-MM-DDTHH:mm'),
    enddate: moment(unit?.slutdato).format('YYYY-MM-DDTHH:mm'),
  });

  const formMethods = useUnitForm<EditUnitType>({
    mode: 'Edit',
    defaultValues: defaultValues,
  });

  const {
    formState: {isDirty},
    reset,
    handleSubmit,
  } = formMethods;

  useEffect(() => {
    if (unit_history != undefined) {
      reset(defaultValues);
    }
  }, [unit_history]);

  useEffect(() => {
    if (metadata != undefined && unit !== undefined && ts_id !== undefined) {
      reset(defaultValues);
    }
  }, [selectedUnit]);

  const Submit = async (data: z.infer<typeof editUnitSchema>) => {
    const payload = {
      gid: selectedUnit,
      ...data,
      startdate: moment(data.startdate).toISOString(),
      enddate: moment(data.enddate).toISOString(),
    };
    metadataEditUnitMutation.mutate(payload, {
      onSuccess: (data, variables, context) => {
        invalidateFromMeta(queryClient, context.meta);
        toast.success('Udstyr er opdateret');
      },
    });
  };

  return (
    <>
      <StationPageBoxLayout>
        <Box
          maxWidth={1080}
          sx={{
            borderRadius: 4,
            boxShadow: 3,
            padding: '16px',
          }}
        >
          <FormProvider {...formMethods}>
            <UdstyrReplace selected={selectedUnit} setSelected={setSelectedUnit} />
            <UnitForm mode="edit" />

            <Box display="flex" gap={1} justifyContent="flex-end" justifySelf="end">
              <Button
                bttype="tertiary"
                disabled={disabled}
                onClick={() => {
                  reset(defaultValues);
                }}
              >
                Annuller
              </Button>

              <Button
                bttype="primary"
                disabled={!isDirty || !metadata?.unit_uuid || disabled}
                onClick={handleSubmit(Submit)}
                startIcon={<SaveIcon />}
                sx={{marginRight: 1}}
              >
                Gem
              </Button>
            </Box>
            <UnitEndDateDialog
              openDialog={openDialog}
              setOpenDialog={setOpenDialog}
              unit={unit_history?.[0]}
            />
            <AddUnitForm
              udstyrDialogOpen={openAddUdstyr}
              setUdstyrDialogOpen={setOpenAddUdstyr}
              tstype_id={tstype_id}
              mode="edit"
            />
          </FormProvider>
        </Box>
      </StationPageBoxLayout>
      <FabWrapper
        icon={<BuildRounded />}
        text={fabText}
        disabled={disabled}
        onClick={() => (mode ? setOpenDialog(true) : setOpenAddUdstyr(true))}
        sx={{visibility: openAddUdstyr || openDialog ? 'hidden' : 'visible'}}
        showText={true}
      />
    </>
  );
};

export default EditUnit;
