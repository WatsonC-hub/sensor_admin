import {Box, Typography} from '@mui/material';
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_ExpandButton,
  MRT_TableOptions,
} from 'material-react-table';
import React, {useMemo, useState} from 'react';

import DeleteAlert from '~/components/DeleteAlert';
import {renderDetailStyle} from '~/consts';
import {useUser} from '~/features/auth/useUser';
import {
  convertDate,
  checkEndDateIsUnset,
  convertDateWithTimeStamp,
  limitDecimalNumbers,
} from '~/helpers/dateConverter';
import {TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import {useTable} from '~/hooks/useTable';
import {MaalepunktTableData} from '~/types';

interface Props {
  data: MaalepunktTableData[];
  handleEdit: (maalepunkt: MaalepunktTableData) => void;
  handleDelete: (gid: number) => void;
  disabled: boolean;
}

export default function MaalepunktTableMobile({data, handleEdit, handleDelete, disabled}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState<number>(-1);
  const user = useUser();

  const onDeleteBtnClick = (id: number) => {
    setMpId(id);
    setDialogOpen(true);
  };

  const columns = useMemo<MRT_ColumnDef<MaalepunktTableData>[]>(
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

            <Box marginLeft={'auto'}>
              <RenderActions
                handleEdit={() => {
                  handleEdit(row.original);
                }}
                onDeleteBtnClick={() => {
                  onDeleteBtnClick(row.original.gid);
                }}
                disabled={disabled || row.original.organisationid != user?.org_id}
              />
            </Box>
          </Box>
        ),
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<MaalepunktTableData>> = {
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
        {row.original.organisationid && (
          <Typography>
            <b>Organisation: </b>
            {row.original.organisationid !== null ? row.original.organisationname : '-'}
          </Typography>
        )}
        {row.original.display_name && (
          <Typography>
            <b>Oprettet af:</b> {row.original.display_name}
          </Typography>
        )}
        <Typography>
          <b>Beskrivelse:</b> {row.original.mp_description}
        </Typography>
      </Box>
    ),
  };

  const table = useTable<MaalepunktTableData>(columns, data, options, undefined, TableTypes.LIST);

  return (
    <Box width={'100%'}>
      <DeleteAlert
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={() => handleDelete(mpId)}
      />
      <MaterialReactTable table={table} />
    </Box>
  );
}
