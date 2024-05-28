import {useMemo, useState} from 'react';
import FormTableComponent from '~/components/FormTableComponent';
import RenderActions from '~/helpers/RowActions';
import {MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import DeleteAlert from '~/components/DeleteAlert';
import {convertDateWithTimeStamp} from '~/helpers/dateConverter';
import {Box} from '@mui/material';
import {BatteryAlertRounded, RemoveRedEyeRounded} from '@mui/icons-material';
import React from 'react';

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
  handleEdit: ({}) => void;
  handleDelete: (gid: number | undefined) => void;
  canEdit: boolean;
}

export default function TilsynTableDesktop({data, handleEdit, handleDelete, canEdit}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);

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
        Cell: ({row, table}) => (
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
                <b>"-"</b>
              )}
              {convertDateWithTimeStamp(row.original.dato)}
            </Box>
          </Box>
        ),
      },
      {
        accessorKey: 'kommentar',
        header: 'Kommentar',
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

  return (
    <>
      <DeleteAlert
        measurementId={mpId}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={handleDelete}
      />
      <FormTableComponent columns={columns} data={data} {...options} />
    </>
  );
}
