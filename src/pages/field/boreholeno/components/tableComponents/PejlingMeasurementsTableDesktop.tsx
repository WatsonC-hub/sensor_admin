import {Box, Checkbox, Typography} from '@mui/material';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import React, {useMemo, useState} from 'react';

import DeleteAlert from '~/components/DeleteAlert';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import {setTableBoxStyle} from '~/consts';
import {useUser} from '~/features/auth/useUser';
import {
  calculatePumpstop,
  convertDateWithTimeStamp,
  limitDecimalNumbers,
} from '~/helpers/dateConverter';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import {useStatefullTableAtom} from '~/hooks/useStatefulTableAtom';
import {useTable} from '~/hooks/useTable';
import {BoreholeMeasurement} from '~/types';

interface Props {
  data: BoreholeMeasurement[] | undefined;
  handleEdit: (measurement: BoreholeMeasurement) => void;
  handleDelete: (gid: number) => void;
  disabled: boolean;
}

export default function PejlingMeasurementsTableDesktop({
  data,
  handleEdit,
  handleDelete,
  disabled,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);
  const unit = 'Pejling (nedstik) [m]';
  const {org_id} = useUser();

  const onDeleteBtnClick = (id: number) => {
    setMpId(id);
    setDialogOpen(true);
  };

  const columns = useMemo<MRT_ColumnDef<BoreholeMeasurement>[]>(
    () => [
      {
        accessorFn: (row) => convertDateWithTimeStamp(row.timeofmeas),
        id: 'timeofmeas',
        header: 'Dato',
      },
      {
        accessorKey: 'pumpstop',
        header: 'Pumpestop',
        Cell: ({row}) => (
          <Typography>
            {calculatePumpstop(
              row.original.timeofmeas,
              row.original.pumpstop,
              row.original.service
            )}
          </Typography>
        ),
      },
      {
        accessorFn: (row) => limitDecimalNumbers(row.disttowatertable_m),
        header: unit,
        id: 'disttowatertable_m',
      },
      {
        accessorKey: 'organisationname',
        header: 'Organisation',
        Cell: ({row, renderedCellValue}) => (
          <Typography>{row.original.organisationid !== null ? renderedCellValue : '-'}</Typography>
        ),
      },
      {
        accessorKey: 'uploaded_status',
        header: 'Uploaded til Jupiter',
        Cell: ({row}) => <Checkbox checked={row.original.uploaded_status} disabled={true} />,
      },
      {accessorKey: 'comment', header: 'Kommentar'},
      {accessorKey: 'display_name', header: 'Oprettet af'},
    ],
    [unit]
  );
  const [tableState, reset] = useStatefullTableAtom<BoreholeMeasurement>(
    'boreholePejlingTableState'
  );

  const options: Partial<MRT_TableOptions<BoreholeMeasurement>> = {
    enableFullScreenToggle: false,
    enableRowActions: true,
    renderRowActions: ({row}) => (
      <RenderActions
        handleEdit={() => {
          handleEdit(row.original);
        }}
        onDeleteBtnClick={() => {
          onDeleteBtnClick(row.original.gid);
        }}
        disabled={disabled || row.original.organisationid != org_id}
      />
    ),
    renderToolbarInternalActions: ({table}) => {
      return <RenderInternalActions table={table} reset={reset} />;
    },
  };

  const table = useTable<BoreholeMeasurement>(
    columns,
    data,
    options,
    tableState,
    TableTypes.TABLE,
    MergeType.RECURSIVEMERGE
  );

  return (
    <Box sx={setTableBoxStyle(636)}>
      <DeleteAlert
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={() => handleDelete(mpId)}
      />
      <MaterialReactTable table={table} />
    </Box>
  );
}
