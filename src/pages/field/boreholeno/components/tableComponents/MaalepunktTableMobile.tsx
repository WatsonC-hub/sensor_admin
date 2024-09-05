import {Box, Typography} from '@mui/material';
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_ExpandButton,
  MRT_TableOptions,
} from 'material-react-table';
import React, {useMemo, useState} from 'react';

import DeleteAlert from '~/components/DeleteAlert';
import {renderDetailStyle, setTableBoxStyle} from '~/consts';
import {
  convertDate,
  checkEndDateIsUnset,
  convertDateWithTimeStamp,
  limitDecimalNumbers,
} from '~/helpers/dateConverter';
import {TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import {useTable} from '~/hooks/useTable';
import {authStore} from '~/state/store';

export type Maalepunkt = {
  startdate: string;
  enddate: string;
  elevation: number;
  organisationid: number;
  organisationname: string;
  mp_description: string;
  gid: number;
  ts_id: number;
  userid: string;
};

interface Props {
  data: Maalepunkt[];
  handleEdit: (maalepunkt: Maalepunkt) => void;
  handleDelete: (gid: number | undefined) => void;
}

export default function MaalepunktTableMobile({data, handleEdit, handleDelete}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState<number>(-1);
  const org_id = authStore((store) => store.org_id);

  const onDeleteBtnClick = (id: number) => {
    setMpId(id);
    setDialogOpen(true);
  };

  const columns = useMemo<MRT_ColumnDef<Maalepunkt>[]>(
    () => [
      {
        accessorFn: (row) => row,
        id: 'content',
        header: 'Indhold',
        enableHide: false,
        Cell: ({row, table, staticRowIndex}) => (
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{width: '100%'}}
            gap={1}
            height={26}
          >
            <MRT_ExpandButton
              sx={{justifyContent: 'left'}}
              row={row}
              table={table}
              staticRowIndex={staticRowIndex}
            />
            <Box display="flex" justifyContent="space-between">
              <Typography width={50} alignSelf={'center'} variant="caption" fontWeight="bold">
                {limitDecimalNumbers(row.original.elevation)} m
              </Typography>
            </Box>
            <Typography margin={'0 auto'} alignSelf={'center'} variant="caption">
              <b>Start: </b> {convertDate(row.original.startdate)}
              <br />
              <b>Slut: </b>
              {checkEndDateIsUnset(row.original.enddate) ? 'Nu' : convertDate(row.original.enddate)}
            </Typography>

            <RenderActions
              handleEdit={() => {
                handleEdit(row.original);
              }}
              onDeleteBtnClick={() => {
                onDeleteBtnClick(row.original.gid);
              }}
              canEdit={row.original.organisationid == org_id}
            />
          </Box>
        ),
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<Maalepunkt>> = {
    renderDetailPanel: ({row}) => (
      <Box sx={renderDetailStyle}>
        <Typography>
          <b>Start dato: </b> {convertDateWithTimeStamp(row.original.startdate)}
        </Typography>
        <Typography>
          <b>Slut dato: </b>
          {checkEndDateIsUnset(row.original.enddate)
            ? 'Nu'
            : convertDateWithTimeStamp(row.original.enddate)}
        </Typography>
        <Typography>
          <b>Organisation: </b>
          {row.original.organisationid !== null ? row.original.organisationname : '-'}
        </Typography>
        <Typography>
          <b>Beskrivelse:</b> {row.original.mp_description}
        </Typography>
      </Box>
    ),
    // muiTablePaperProps: {
    //   sx: {
    //     boxShadow: 'none',
    //     p: 0,
    //     margin: 'auto',
    //     width: '100%',
    //   },
    // },
  };

  const table = useTable<Maalepunkt>(columns, data, options, undefined, TableTypes.LIST);

  return (
    <Box sx={setTableBoxStyle(320)} width={'100%'}>
      <DeleteAlert
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={() => handleDelete(mpId)}
      />
      <MaterialReactTable table={table} />
    </Box>
  );
}
