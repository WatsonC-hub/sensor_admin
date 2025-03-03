import {BatteryAlertRounded, RemoveRedEyeRounded} from '@mui/icons-material';
import {Box} from '@mui/material';
import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import React, {useMemo, useState} from 'react';

import DeleteAlert from '~/components/DeleteAlert';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import {setTableBoxStyle} from '~/consts';
import {useTilsyn} from '~/features/tilsyn/api/useTilsyn';
import {convertDateWithTimeStamp} from '~/helpers/dateConverter';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import {useStatefullTableAtom} from '~/hooks/useStatefulTableAtom';
import {useQueryTable} from '~/hooks/useTable';
import {TilsynItem} from '~/types';

interface Props {
  handleEdit: (tilsyn: TilsynItem) => void;
  handleDelete: (gid: number | undefined) => void;
  disabled: boolean;
}

export default function TilsynTableDesktop({handleEdit, handleDelete, disabled}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);
  const {get} = useTilsyn();

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
        size: 150,
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
      {
        header: 'Oprettet af',
        accessorKey: 'display_name',
      },
    ],
    []
  );
  const [tableState, reset] = useStatefullTableAtom<TilsynItem>('TilsynTableState');
  const options: Partial<MRT_TableOptions<TilsynItem>> = {
    enableFullScreenToggle: false,
    localization: {noRecordsToDisplay: 'Ingen tilsyn at vise'},
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

  const table = useQueryTable<TilsynItem>(
    columns,
    get,
    options,
    tableState,
    TableTypes.TABLE,
    MergeType.RECURSIVEMERGE
  );

  return (
    <Box sx={setTableBoxStyle(680)}>
      <DeleteAlert
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={() => handleDelete(mpId)}
      />
      <MaterialReactTable table={table} />
    </Box>
  );
}
