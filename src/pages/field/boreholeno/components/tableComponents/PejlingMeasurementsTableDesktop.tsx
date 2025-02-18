import {Box, Checkbox, Typography} from '@mui/material';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import React, {useMemo, useState} from 'react';

import DeleteAlert from '~/components/DeleteAlert';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import {setTableBoxStyle} from '~/consts';
import {
  calculatePumpstop,
  convertDateWithTimeStamp,
  limitDecimalNumbers,
} from '~/helpers/dateConverter';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import {useStatefullTableAtom} from '~/hooks/useStatefulTableAtom';
import {useTable} from '~/hooks/useTable';
import {useAuthStore} from '~/state/store';

export type Kontrol = {
  comment: string;
  gid: number;
  disttowatertable_m: number;
  timeofmeas: string;
  useforcorrection: number;
  pumpstop: string;
  service: boolean;
  organisationid: number;
  organisationname: string;
  uploaded_status: boolean;
};

interface Props {
  data: Kontrol[];
  handleEdit: (kontrol: Kontrol) => void;
  handleDelete: (gid: number) => void;
}

export default function PejlingMeasurementsTableDesktop({data, handleEdit, handleDelete}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);
  const {data: timeseries} = useTimeseriesData();
  const tstype_id = timeseries?.tstype_id;
  const stationUnit = timeseries?.unit;
  const org_id = useAuthStore((store) => store.org_id);

  const unit = tstype_id === 1 ? 'Pejling (nedstik) [m]' : `Måling [${stationUnit}]`;

  const onDeleteBtnClick = (id: number) => {
    setMpId(id);
    setDialogOpen(true);
  };

  const columns = useMemo<MRT_ColumnDef<Kontrol>[]>(
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
  const [tableState, reset] = useStatefullTableAtom<Kontrol>('boreholePejlingTableState');

  const options: Partial<MRT_TableOptions<Kontrol>> = {
    enableRowActions: true,
    renderRowActions: ({row}) => (
      <RenderActions
        handleEdit={() => {
          handleEdit(row.original);
        }}
        onDeleteBtnClick={() => {
          onDeleteBtnClick(row.original.gid);
        }}
        canEdit={row.original.organisationid == org_id}
      />
    ),
    renderToolbarInternalActions: ({table}) => {
      return <RenderInternalActions table={table} reset={reset} />;
    },
  };

  const table = useTable<Kontrol>(
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
