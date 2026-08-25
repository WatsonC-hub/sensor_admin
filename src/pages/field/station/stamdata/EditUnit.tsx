import {BuildRounded} from '@mui/icons-material';
import {Box} from '@mui/material';
import dayjs from 'dayjs';
import React, {useState} from 'react';
import {FormProvider} from 'react-hook-form';

import FabWrapper from '~/components/FabWrapper';
import {useUnitMutations} from '~/features/stamdata/api/useUnit';
import useUnitForm from '~/features/station/api/useUnitForm';
import StationPageBoxLayout from '~/features/station/components/StationPageBoxLayout';
import {editUnitSchema} from '~/features/station/schema';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import {useAppContext} from '~/state/contexts';

import AddUnitsDialog from './AddUnitsDialog';
import EndUnitsDialog from './EndUnitsDialog';
import UnitHistoryTable from './UnitHistoryTable';

import type {EditUnit as EditUnitType} from '~/features/station/schema';

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

  const editFormMethods = useUnitForm({
    schema: editUnitSchema,
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
        sx={{
          maxWidth: 1080,
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
      <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
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
