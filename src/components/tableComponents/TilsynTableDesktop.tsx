import {BatteryAlertRounded, RemoveRedEyeRounded} from '@mui/icons-material';
import {Box} from '@mui/material';
import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import React, {useMemo, useState} from 'react';

import DeleteAlert from '~/components/DeleteAlert';
import {setTableBoxStyle} from '~/consts';
import {convertDateWithTimeStamp} from '~/helpers/dateConverter';
import RenderActions from '~/helpers/RowActions';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useTable} from '~/hooks/useTable';

export type Tilsyn = {
  batteriskift: boolean;
  dato: string;
  gid: number;
  kommentar: string;
  pejling?: string;
  terminal_id: string;
  tilsyn: boolean;
  userid: number;
};

interface Props {
  data: Tilsyn[];
  handleEdit: (tilsyn: Tilsyn) => void;
  handleDelete: (gid: number | undefined) => void;
  canEdit: boolean;
}

export default function TilsynTableDesktop({data, handleEdit, handleDelete, canEdit}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);
  const {isTablet} = useBreakpoints();

  const onDeleteBtnClick = (id: number) => {
    setMpId(id);
    setDialogOpen(true);
  };

  const columns = useMemo<MRT_ColumnDef<Tilsyn>[]>(
    () => [
      {
        accessorFn: (row) => row,
        id: 'batteriskift',
        header: 'Tilsyn',
        size: 200,
        Cell: ({row}) => (
          <Box display="flex" gap={1}>
            <Box alignSelf="center">
              {row.original.batteriskift ? (
                <BatteryAlertRounded sx={{color: 'grey.700'}} />
              ) : row.original.tilsyn ? (
                <RemoveRedEyeRounded sx={{color: 'grey.700'}} />
              ) : (
                ''
              )}
            </Box>
            <Box display="flex" flexDirection="column">
              {row.original.batteriskift && row.original.tilsyn ? (
                <b>Batteri skiftet og tilsyn</b>
              ) : row.original.batteriskift && row.original.tilsyn !== true ? (
                <b>Batteri skiftet</b>
              ) : row.original.batteriskift !== true && row.original.tilsyn ? (
                <b>Tilsyn</b>
              ) : (
                <b>-</b>
              )}
              {convertDateWithTimeStamp(row.original.dato)}
            </Box>
          </Box>
        ),
      },
      {
        accessorKey: 'kommentar',
        header: 'Kommentar',
        size: 300,
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<Tilsyn>> = {
    renderRowActions: ({row}) => (
      <RenderActions
        handleEdit={() => {
          handleEdit(row.original);
        }}
        onDeleteBtnClick={() => {
          onDeleteBtnClick(row.original.gid);
        }}
        canEdit={canEdit}
      />
    ),
  };

  const table = useTable<Tilsyn>(columns, data, options);

  return (
    <Box sx={setTableBoxStyle(isTablet ? 436 : 636)}>
      <DeleteAlert
        measurementId={mpId}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={handleDelete}
      />
      <MaterialReactTable table={table} />
    </Box>
  );
}
