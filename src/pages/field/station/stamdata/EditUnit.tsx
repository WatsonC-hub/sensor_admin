import {Box} from '@mui/material';
import React, {useState} from 'react';
import {FormProvider} from 'react-hook-form';

import {useTimeseriesData} from '~/hooks/query/useMetadata';
import {useAppContext} from '~/state/contexts';
import StationPageBoxLayout from '~/features/station/components/StationPageBoxLayout';
import FabWrapper from '~/components/FabWrapper';
import {BuildRounded} from '@mui/icons-material';
import useUnitForm from '~/features/station/api/useUnitForm';
import {EditUnit as EditUnitType, editUnitSchema} from '~/features/station/schema';

import UnitHistoryTable from './UnitHistoryTable';
import {useUnitMutations} from '~/features/stamdata/api/useUnit';
import dayjs from 'dayjs';
import AddUnitsDialog from './AddUnitsDialog';
import EndUnitsDialog from './EndUnitsDialog';

const EditUnit = () => {
  const {ts_id, loc_id} = useAppContext(['loc_id', 'ts_id']);
  const [openUnitsDialog, setOpenUnitsDialog] = useState(false);
  const [hjemtagUdstyrDialog, setHjemtagUdstyrDialog] = useState(false);
  const {data: metadata} = useTimeseriesData();
  const [editingGid, setEditingGid] = useState<number | ''>('');
  const has_active_unit = metadata?.unit_uuid && dayjs(metadata?.slutdato).isAfter(dayjs());
  const {
    editUnit: {mutateAsync: editUnit},
  } = useUnitMutations(ts_id);

  const editFormMethods = useUnitForm<EditUnitType>({
    schema: editUnitSchema,
    mode: 'Edit',
    defaultValues: {
      unit_uuid: metadata?.unit_uuid ?? '',
      startdate: metadata?.startdato ? dayjs(metadata.startdato) : undefined,
      enddate: metadata?.slutdato ? dayjs(metadata.slutdato) : undefined,
    },
    values: metadata?.unit_uuid
      ? {
          unit_uuid: metadata.unit_uuid,
          startdate: dayjs(metadata.startdato),
          enddate: dayjs(metadata.slutdato),
        }
      : undefined,
  });

  const Submit = async (data: EditUnitType) => {
    const payload = {
      gid: editingGid,
      ...data,
    };
    await editUnit(payload);
  };

  return (
    <StationPageBoxLayout>
      <Box
        maxWidth={1080}
        sx={{
          borderRadius: 4,
          py: 1,
        }}
      >
        <FormProvider {...editFormMethods}>
          <UnitHistoryTable
            ts_id={ts_id}
            loc_id={loc_id}
            setSelectedUnit={setEditingGid}
            submit={Submit}
          />
        </FormProvider>

        {openUnitsDialog && (
          <AddUnitsDialog open={openUnitsDialog} onClose={() => setOpenUnitsDialog(false)} />
        )}

        {hjemtagUdstyrDialog && (
          <EndUnitsDialog
            open={hjemtagUdstyrDialog}
            onClose={() => setHjemtagUdstyrDialog(false)}
          />
        )}
      </Box>
      <Box display="flex" justifyContent={'flex-end'}>
        <FabWrapper
          icon={<BuildRounded />}
          text={!has_active_unit ? 'Tilføj udstyr' : 'Hjemtag udstyr'}
          disabled={false}
          onClick={() =>
            !has_active_unit ? setOpenUnitsDialog(true) : setHjemtagUdstyrDialog(true)
          }
          sx={{visibility: openUnitsDialog || hjemtagUdstyrDialog ? 'hidden' : 'visible'}}
          showText={true}
        />
      </Box>
    </StationPageBoxLayout>
  );
};

export default EditUnit;
