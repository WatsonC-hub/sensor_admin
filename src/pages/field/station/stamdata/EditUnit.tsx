import {Box} from '@mui/material';
import moment from 'moment';
import React, {useState} from 'react';
import {FormProvider} from 'react-hook-form';
import {z} from 'zod';

import {useUnitHistory} from '~/features/stamdata/api/useUnitHistory';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import {useAppContext} from '~/state/contexts';
import StationPageBoxLayout from '~/features/station/components/StationPageBoxLayout';
import usePermissions from '~/features/permissions/api/usePermissions';
import FabWrapper from '~/components/FabWrapper';
import {BuildRounded} from '@mui/icons-material';
import AddUnitForm from '~/features/stamdata/components/stamdata/AddUnitForm';
import UnitEndDateDialog from './UnitEndDialog';
import useUnitForm from '~/features/station/api/useUnitForm';
import {EditUnit as EditUnitType, editUnitSchema} from '~/features/station/schema';

import UnitHistoryTable from './UnitHistoryTable';
import {useUnitMutations} from '~/features/stamdata/api/useUnit';

const EditUnit = () => {
  const {ts_id, loc_id} = useAppContext(['loc_id', 'ts_id']);
  const {data: metadata} = useTimeseriesData();
  const {data: unit_history} = useUnitHistory();
  const [selectedUnit, setSelectedUnit] = useState<number | ''>(unit_history?.[0]?.gid ?? '');
  const [openDialog, setOpenDialog] = useState(false);
  const [openAddUdstyr, setOpenAddUdstyr] = useState(false);
  const {editUnit} = useUnitMutations(ts_id);
  const {location_permissions} = usePermissions(loc_id);
  const tstype_id = metadata?.tstype_id;
  const disabled = location_permissions !== 'edit';

  const mode =
    unit_history && unit_history.length > 0 && moment(unit_history?.[0].slutdato) > moment();
  const fabText = mode ? 'Hjemtag udstyr' : 'Tilføj udstyr';

  const unit = unit_history?.find((item) => item.gid == selectedUnit);

  const {data: defaultValues} = editUnitSchema.safeParse({
    unit_uuid: unit?.uuid,
    startdate: unit?.startdato,
    enddate: unit?.slutdato,
  });

  const formMethods = useUnitForm<EditUnitType>({
    mode: selectedUnit !== '' && !openAddUdstyr ? 'Edit' : 'Add',
    values: defaultValues,
  });

  const Submit = async (data: z.infer<typeof editUnitSchema>) => {
    const payload = {
      gid: selectedUnit,
      ...data,
    };
    editUnit.mutate(payload);
  };

  return (
    <>
      <StationPageBoxLayout>
        <Box
          maxWidth={1080}
          sx={{
            borderRadius: 4,
            padding: '16px',
          }}
        >
          <FormProvider {...formMethods}>
            <UnitHistoryTable
              submit={Submit}
              setSelectedUnit={setSelectedUnit}
              ts_id={ts_id}
              loc_id={loc_id}
            />
            {openDialog && (
              <UnitEndDateDialog
                openDialog={openDialog}
                setOpenDialog={setOpenDialog}
                unit={unit_history?.[0]}
              />
            )}
            <AddUnitForm
              udstyrDialogOpen={openAddUdstyr}
              setUdstyrDialogOpen={setOpenAddUdstyr}
              tstype_id={tstype_id}
              mode="edit"
            />
          </FormProvider>
        </Box>
        <Box display="flex" justifyContent={'flex-end'}>
          <FabWrapper
            icon={<BuildRounded />}
            text={fabText}
            disabled={disabled}
            onClick={() => (mode ? setOpenDialog(true) : setOpenAddUdstyr(true))}
            sx={{visibility: openAddUdstyr || openDialog ? 'hidden' : 'visible'}}
            showText={true}
          />
        </Box>
      </StationPageBoxLayout>
    </>
  );
};

export default EditUnit;
