import {Typography, Box} from '@mui/material';

import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import React, {useMemo, useState} from 'react';

import DeleteAlert from '~/components/DeleteAlert';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import {correction_map, setTableBoxStyle} from '~/consts';
import {usePejling} from '~/features/pejling/api/usePejling';
import {
  calculatePumpstop,
  convertDateWithTimeStamp,
  limitDecimalNumbers,
} from '~/helpers/dateConverter';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import {useStatefullTableAtom} from '~/hooks/useStatefulTableAtom';
import {useQueryTable} from '~/hooks/useTable';
import {PejlingItem} from '~/types';

interface Props {
  handleEdit: (kontrol: PejlingItem) => void;
  handleDelete: (gid: number) => void;
  disabled: boolean;
}

export default function PejlingBoreholeTableDesktop({handleEdit, handleDelete, disabled}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);
  const {data: timeseries} = useTimeseriesData();
  const tstype_id = timeseries?.tstype_id;
  const stationUnit = timeseries?.unit;
  const isWaterlevel = timeseries == undefined ? true : timeseries.tstype_id === 1;

  const unit = tstype_id === 1 ? 'Nedstik [m]' : `Kontrol [${stationUnit}]`;

  const {get} = usePejling();

  const onDeleteBtnClick = (id: number) => {
    setMpId(id);
    setDialogOpen(true);
  };
  const columns = useMemo<MRT_ColumnDef<PejlingItem>[]>(
    () => [
      {
        accessorFn: (row) => convertDateWithTimeStamp(row.timeofmeas),
        sortingFn: (a, b) => (a.original.timeofmeas > b.original.timeofmeas ? 1 : -1),
        id: 'timeofmeas',
        header: 'Dato',
        size: 150,
      },
      {
        accessorKey: 'pumpstop',
        header: 'Pumpestop',
        Cell: ({row}) => (
          <Typography variant="body2">
            {calculatePumpstop(
              row.original.timeofmeas,
              row.original.pumpstop,
              row.original.service
            )}
          </Typography>
        ),
      },
      {
        accessorFn: (row) => limitDecimalNumbers(row.measurement),
        header: unit,
        id: 'measurement',
        size: 140,
      },
      ...(isWaterlevel
        ? ([
            {
              accessorFn: (row) => limitDecimalNumbers(row.referenced_measurement),
              header: `Kote [m DVR90]`,
              size: 140,
            },
          ] as MRT_ColumnDef<PejlingItem>[])
        : []),
      {
        accessorFn: (row) =>
          correction_map[row.useforcorrection] ? correction_map[row.useforcorrection] : 'Kontrol',
        header: 'Anvendelse',
        id: 'useforcorrection',
        enableColumnFilter: true,
      },
      {accessorKey: 'comment', header: 'Kommentar', enableColumnFilter: false},
      {accessorKey: 'display_name', header: 'Oprettet af', enableColumnFilter: false},
    ],
    [unit, isWaterlevel]
  );

  const [tableState, reset] = useStatefullTableAtom<PejlingItem>('PejlingBoreholeTableState');

  const options: Partial<MRT_TableOptions<PejlingItem>> = {
    enableRowActions: true,
    renderRowActions: ({row}) => (
      <RenderActions
        handleEdit={() => {
          handleEdit(row.original);
        }}
        onDeleteBtnClick={() => {
          onDeleteBtnClick(row.original.gid);
        }}
        disabled={disabled}
      />
    ),
    renderToolbarInternalActions: ({table}) => {
      return <RenderInternalActions table={table} reset={reset} />;
    },
  };

  const table = useQueryTable<PejlingItem>(
    columns,
    get,
    options,
    tableState,
    TableTypes.TABLE,
    MergeType.RECURSIVEMERGE
  );

  return (
    <Box sx={setTableBoxStyle(710)}>
      <DeleteAlert
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={() => handleDelete(mpId)}
      />
      <MaterialReactTable table={table} />
    </Box>
  );
}
