import {Box, Typography} from '@mui/material';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import React, {useMemo, useState} from 'react';

import DeleteAlert from '~/components/DeleteAlert';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import {setTableBoxStyle} from '~/consts';
import {convertDate, checkEndDateIsUnset, limitDecimalNumbers} from '~/helpers/dateConverter';
import {TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import {useStatefullTableAtom} from '~/hooks/useStatefulTableAtom';
import {useTable} from '~/hooks/useTable';
import {useAuthStore} from '~/state/store';
import {MaalepunktTableData} from '~/types';

interface Props {
  data: MaalepunktTableData[];
  handleEdit: (maalepuntk: MaalepunktTableData) => void;
  handleDelete: (gid: number) => void;
}

export default function MaalepunktTableDesktop({data, handleEdit, handleDelete}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);
  const org_id = useAuthStore((store) => store.org_id);

  const onDeleteBtnClick = (id: number) => {
    setMpId(id);
    setDialogOpen(true);
  };

  const columns = useMemo<MRT_ColumnDef<MaalepunktTableData>[]>(
    () => [
      {
        accessorFn: (row) => (
          <Typography sx={{display: 'inline', justifySelf: 'flex-end'}}>
            <b>Start: </b> {convertDate(row.startdate)}
            <br />
            <b>Slut: </b> {checkEndDateIsUnset(row.enddate) ? 'Nu' : convertDate(row.enddate)}
          </Typography>
        ),
        id: 'date',
        header: 'Dato',
        enableHide: false,
      },
      {
        accessorFn: (row) => limitDecimalNumbers(row.elevation),
        header: 'Målepunktskote [m]',
        id: 'elevation',
      },
      {
        accessorKey: 'organisationname',
        header: 'Organisation',
        Cell: ({row, renderedCellValue}) => (
          <Typography>
            {row.original.organisationid === org_id ? renderedCellValue : '-'}
          </Typography>
        ),
      },
      {
        header: 'Beskrivelse',
        accessorKey: 'mp_description',
        Cell: ({row}) => <Typography>{row.getValue('mp_description')}</Typography>,
      },
      {header: 'Oprettet af', accessorKey: 'display_name'},
    ],
    []
  );
  const [tableState, reset] = useStatefullTableAtom<MaalepunktTableData>('MaalepunktTableState');

  const options: Partial<MRT_TableOptions<MaalepunktTableData>> = {
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

  const table = useTable<MaalepunktTableData>(columns, data, options, tableState, TableTypes.TABLE);

  return (
    <Box sx={setTableBoxStyle(886)}>
      <DeleteAlert
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={() => handleDelete(mpId)}
      />
      <MaterialReactTable table={table} />
    </Box>
  );
}
