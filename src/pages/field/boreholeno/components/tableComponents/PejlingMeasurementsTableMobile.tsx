import {Box, Checkbox, Typography} from '@mui/material';
import {
  MRT_ColumnDef,
  MRT_TableOptions,
  MRT_ExpandButton,
  MaterialReactTable,
} from 'material-react-table';
import React, {useMemo, useState} from 'react';

import DeleteAlert from '~/components/DeleteAlert';
import {useUser} from '~/features/auth/useUser';
import {
  calculatePumpstop,
  convertDate,
  convertDateWithTimeStamp,
  limitDecimalNumbers,
} from '~/helpers/dateConverter';
import {TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import {useTable} from '~/hooks/useTable';
import {Kontrol} from '~/types';

interface Props {
  data: Kontrol[];
  handleEdit: (kontrol: Kontrol) => void;
  handleDelete: (gid: number) => void;
  disabled: boolean;
}

export default function PejlingMeasurementsTableMobile({
  data,
  handleEdit,
  handleDelete,
  disabled,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);
  const unit = ' m';
  const user = useUser();

  const onDeleteBtnClick = (id: number) => {
    setMpId(id);
    setDialogOpen(true);
  };

  const columns = useMemo<MRT_ColumnDef<Kontrol>[]>(
    () => [
      {
        accessorFn: (row) => row,
        id: 'content',
        header: 'Indhold',
        enableHide: false,
        Cell: ({row, table, staticRowIndex}) => (
          <Box
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
            gap={1}
            height={26}
          >
            <MRT_ExpandButton row={row} table={table} staticRowIndex={staticRowIndex} />
            <Box display="flex" flexDirection={'column'}>
              <Typography alignSelf={'center'} variant="caption" fontWeight="bold">
                {limitDecimalNumbers(row.original.disttowatertable_m)} {unit}
              </Typography>
              <Typography alignSelf={'center'} variant="caption" color="grey.700" fontWeight="bold">
                {convertDate(row.original.timeofmeas)}
              </Typography>
            </Box>

            <Typography margin="0 auto">
              {row.original.organisationid !== null ? row.original.organisationname : '-'}
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
    [unit, disabled, handleEdit]
  );

  const options: Partial<MRT_TableOptions<Kontrol>> = {
    renderDetailPanel: ({row}) => (
      <Box
        sx={{
          border: 'none',
          backgroundColor: 'grey.300',
          mt: -7.7,
          pt: 7,
          px: 2,
          mx: -2,
          transition: 'transform 0.2s',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          borderBottomLeftRadius: '15px',
          borderBottomRightRadius: '15px',
        }}
      >
        <Typography>
          <b>Dato: </b> {convertDateWithTimeStamp(row.original.timeofmeas)}
        </Typography>
        <Typography>
          <b>Uploaded til Jupiter: </b>{' '}
          <Checkbox checked={row.original.uploaded_status} disabled={true} />
        </Typography>
        {row.original.pumpstop !== null && (
          <Typography>
            <b>Pumpestop: </b>
            {calculatePumpstop(
              row.original.timeofmeas,
              row.original.pumpstop,
              row.original.service
            )}
          </Typography>
        )}
        {row.original.organisationid !== null && (
          <Typography>
            <b>Organisation: </b>
            {row.original.organisationid !== null ? row.original.organisationname : '-'}
          </Typography>
        )}
        {row.original.display_name && (
          <Typography>
            <b>Oprettet af: </b> {row.original.display_name}
          </Typography>
        )}
        {row.original.comment && (
          <Typography>
            <b>Kommentar: </b> {row.original.comment}
          </Typography>
        )}
      </Box>
    ),
  };

  const table = useTable<Kontrol>(columns, data, options, undefined, TableTypes.LIST);

  return (
    <Box>
      <DeleteAlert
        measurementId={mpId}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={() => handleDelete(mpId)}
      />
      <MaterialReactTable table={table} />
    </Box>
  );
}
