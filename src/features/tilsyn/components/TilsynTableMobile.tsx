import {BatteryAlertRounded, RemoveRedEyeRounded} from '@mui/icons-material';
import {Box, Typography} from '@mui/material';
import {
  MRT_ColumnDef,
  MRT_ExpandButton,
  MRT_TableOptions,
  MaterialReactTable,
} from 'material-react-table';
import {useEffect, useMemo, useState} from 'react';

import DeleteAlert from '~/components/DeleteAlert';
import {renderDetailStyle} from '~/consts';
import {convertDate, convertDateWithTimeStamp} from '~/helpers/dateConverter';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import {useTable} from '~/hooks/useTable';
import {TilsynItem} from '~/types';

interface Props {
  data: TilsynItem[] | undefined;
  handleEdit: (tilyn: TilsynItem) => void;
  handleDelete: (gid: number | undefined) => void;
  canEdit: boolean;
}

export default function TilsynTableMobile({data, handleEdit, handleDelete, canEdit}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);
  const [height, setHeight] = useState<number>();

  const onDeleteBtnClick = (id: number) => {
    setMpId(id);
    setDialogOpen(true);
  };

  useEffect(() => {
    if (data) setHeight(data.length > 10 ? 10 * 60 : data.length * 60);
  }, [data]);

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
                canEdit={canEdit}
              />
            </Box>
          </Box>
        ),
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<TilsynItem>> = {
    renderDetailPanel: ({row}) => (
      <Box sx={renderDetailStyle}>
        <Typography>
          <b>Dato: </b> {convertDateWithTimeStamp(row.original.dato)}
        </Typography>
        {row.original.kommentar && (
          <Typography>
            <b>Kommentar:</b> {row.original.kommentar}
          </Typography>
        )}
      </Box>
    ),
  };

  const table = useTable<TilsynItem>(
    columns,
    data,
    options,
    undefined,
    TableTypes.LIST,
    MergeType.RECURSIVEMERGE
  );

  return (
    <Box height={height}>
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
