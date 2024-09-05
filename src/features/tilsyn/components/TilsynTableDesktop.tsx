import {BatteryAlertRounded, RemoveRedEyeRounded} from '@mui/icons-material';
import {Box} from '@mui/material';
import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import React, {useMemo, useState} from 'react';

import DeleteAlert from '~/components/DeleteAlert';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import {setTableBoxStyle} from '~/consts';
import {convertDateWithTimeStamp} from '~/helpers/dateConverter';
import {TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useStatefullTableAtom} from '~/hooks/useStatefulTableAtom';
import {useTable} from '~/hooks/useTable';
import {TilsynItem} from '~/types';

interface Props {
  data: TilsynItem[] | undefined;
  handleEdit: (tilsyn: TilsynItem) => void;
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
  const columns = useMemo<MRT_ColumnDef<TilsynItem>[]>(
    () => [
      {
        header: 'Dato',
        id: 'dato',
        accessorFn: (row) => convertDateWithTimeStamp(row.dato),
        sortingFn: (a, b) => (a.original.dato > b.original.dato ? 1 : -1),
      },
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
  const [tableState, reset] = useStatefullTableAtom<TilsynItem>('TilsynTableState');
  const options: Partial<MRT_TableOptions<TilsynItem>> = {
    enableRowActions: true,
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
    renderToolbarInternalActions: ({table}) => {
      return <RenderInternalActions table={table} reset={reset} />;
    },
  };

  const table = useTable<TilsynItem>(columns, data, options, tableState, TableTypes.TABLE);

  return (
    <Box sx={setTableBoxStyle(isTablet ? 436 : 636)}>
      <DeleteAlert
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={() => handleDelete(mpId)}
      />
      <MaterialReactTable table={table} />
    </Box>
  );
}
