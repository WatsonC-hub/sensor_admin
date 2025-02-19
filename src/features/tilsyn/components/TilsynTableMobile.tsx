import {BatteryAlertRounded, RemoveRedEyeRounded} from '@mui/icons-material';
import {Box, Typography} from '@mui/material';
import {
  MRT_ColumnDef,
  MRT_ExpandButton,
  MRT_TableOptions,
  MaterialReactTable,
} from 'material-react-table';
import {useMemo, useState} from 'react';

import DeleteAlert from '~/components/DeleteAlert';
import {renderDetailStyle} from '~/consts';
import {useTilsyn} from '~/features/tilsyn/api/useTilsyn';
import {convertDate, convertDateWithTimeStamp} from '~/helpers/dateConverter';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import {useQueryTable} from '~/hooks/useTable';
import {TilsynItem} from '~/types';

interface Props {
  handleEdit: (tilyn: TilsynItem) => void;
  handleDelete: (gid: number | undefined) => void;
}

export default function TilsynTableMobile({handleEdit, handleDelete}: Props) {
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
        accessorFn: (row) => row,
        id: 'content',
        header: 'Indhold',
        enableHide: false,
        Cell: ({row, staticRowIndex, table}) => (
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

            <Box display="flex" marginRight="auto" gap={1}>
              {row.original.batteriskift ? (
                <BatteryAlertRounded sx={{color: 'grey.700', alignSelf: 'center'}} />
              ) : row.original.tilsyn ? (
                <RemoveRedEyeRounded sx={{color: 'grey.700', alignSelf: 'center'}} />
              ) : (
                ''
              )}
              <Box display="flex" flexDirection="column">
                {row.original.batteriskift && row.original.tilsyn ? (
                  <Typography variant="caption" fontWeight="bold">
                    Batteri skiftet og tilsyn
                  </Typography>
                ) : row.original.batteriskift && row.original.tilsyn !== true ? (
                  <Typography variant="caption" fontWeight="bold">
                    Batteri skiftet
                  </Typography>
                ) : row.original.batteriskift !== true && row.original.tilsyn ? (
                  <Typography variant="caption" fontWeight="bold">
                    Tilsyn
                  </Typography>
                ) : null}
                <Typography variant="caption" fontWeight={700} color="grey.700">
                  {convertDate(row.original.dato)}
                </Typography>
              </Box>
            </Box>
            <Box marginLeft={'auto'}>
              <RenderActions
                handleEdit={() => {
                  handleEdit(row.original);
                }}
                onDeleteBtnClick={() => {
                  onDeleteBtnClick(row.original.gid);
                }}
                canEdit={true}
              />
            </Box>
          </Box>
        ),
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<TilsynItem>> = {
    localization: {noRecordsToDisplay: 'Ingen tilsyn at vise'},
    renderDetailPanel: ({row}) => (
      <Box sx={renderDetailStyle}>
        <Typography>
          <b>Dato: </b> {convertDateWithTimeStamp(row.original.dato)}
        </Typography>
        {row.original.display_name && (
          <Typography>
            <b>Oprettet af:</b> {row.original.display_name}
          </Typography>
        )}
        {row.original.kommentar && (
          <Typography>
            <b>Kommentar:</b> {row.original.kommentar}
          </Typography>
        )}
      </Box>
    ),
  };

  const table = useQueryTable<TilsynItem>(
    columns,
    get,
    options,
    undefined,
    TableTypes.LIST,
    MergeType.RECURSIVEMERGE
  );

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
