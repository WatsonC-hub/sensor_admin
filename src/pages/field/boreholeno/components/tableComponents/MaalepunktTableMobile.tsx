import {Box, Typography} from '@mui/material';
import type {MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import {MaterialReactTable, MRT_ExpandButton} from 'material-react-table';
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
import {TableTypes} from '~/helpers/enumHelper';
import RenderActions from '~/helpers/RowActions';
import {useTable} from '~/hooks/useTable';
import type {BoreholeMaalepunktTableData} from '~/types';
import type {BoreholeMaalepunkt} from '../../Boreholeno';
import dayjs from 'dayjs';

interface Props {
  data: BoreholeMaalepunktTableData[] | undefined;
  handleEdit: (maalepunkt: BoreholeMaalepunkt) => void;
  handleDelete: (gid: number) => void;
  disabled: boolean;
}

export default function MaalepunktTableMobile({data, handleEdit, handleDelete, disabled}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState<number>(-1);
  const {org_id} = useUser();

  const onDeleteBtnClick = (id: number) => {
    setMpId(id);
    setDialogOpen(true);
  };

  const columns = useMemo<MRT_ColumnDef<BoreholeMaalepunktTableData>[]>(
    () => [
      {
        accessorFn: (row) => row,
        id: 'content',
        header: 'Indhold',
        enableHide: false,
        Cell: ({row, table, staticRowIndex}) => (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1,
              height: 26,
              width: '100%',
            }}
          >
            <MRT_ExpandButton
              sx={{justifyContent: 'left'}}
              row={row}
              table={table}
              staticRowIndex={staticRowIndex}
            />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  width: 50,
                  alignSelf: 'center',
                  fontWeight: 'bold',
                }}
              >
                {limitDecimalNumbers(row.original.elevation)} m
              </Typography>
            </Box>
            <Typography
              variant="caption"
              sx={{
                margin: '0 auto',
                alignSelf: 'center',
              }}
            >
              <b>Start: </b> {convertDate(row.original.startdate)}
              <br />
              <b>Slut: </b>
              {checkEndDateIsUnset(row.original.enddate) ? 'Nu' : convertDate(row.original.enddate)}
            </Typography>

            <Box
              sx={{
                marginLeft: 'auto',
              }}
            >
              <RenderActions
                handleEdit={() => {
                  const maalepunkt: BoreholeMaalepunkt = {
                    ...row.original,
                    startdate: dayjs(row.original.startdate),
                    enddate: dayjs(row.original.enddate),
                  };
                  handleEdit(maalepunkt);
                }}
                onDeleteBtnClick={() => {
                  onDeleteBtnClick(row.original.gid);
                }}
                disabled={disabled || row.original.organisationid != org_id}
              />
            </Box>
          </Box>
        ),
      },
    ],
    [disabled, handleEdit]
  );

  const options: Partial<MRT_TableOptions<BoreholeMaalepunktTableData>> = {
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

  const table = useTable<BoreholeMaalepunktTableData>(
    columns,
    data,
    options,
    undefined,
    TableTypes.LIST
  );

  return (
    <Box
      sx={{
        width: '100%',
      }}
    >
      <DeleteAlert
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={() => handleDelete(mpId)}
      />
      <MaterialReactTable table={table} />
    </Box>
  );
}
