import {Box, Typography} from '@mui/material';
import {
  MRT_ColumnDef,
  MRT_TableOptions,
  MRT_ExpandButton,
  MaterialReactTable,
} from 'material-react-table';
import React, {useMemo, useState} from 'react';

import DeleteAlert from '~/components/DeleteAlert';
import {setTableBoxStyle, renderDetailStyle} from '~/consts';
import {convertDate, convertDateWithTimeStamp, limitDecimalNumbers} from '~/helpers/dateConverter';
import RenderActions from '~/helpers/RowActions';
import {useTable} from '~/hooks/useTable';
import {stamdataStore} from '~/state/store';

export type Kontrol = {
  comment: string;
  gid: number;
  measurement: number;
  timeofmeas: string;
  ts_id: number;
  updated_at: string;
  useforcorrection: number;
  userid: string;
};

interface Props {
  data: Kontrol[] | undefined;
  handleEdit: (kontrol: Kontrol) => void;
  handleDelete: (gid: number | undefined) => void;
  canEdit: boolean;
  correction_map: Record<number, string>;
}

export default function PejlingMeasurementsTableMobile({
  data,
  handleEdit,
  handleDelete,
  canEdit,
  correction_map,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);
  const [timeseries] = stamdataStore((state) => [state.timeseries]);

  const unit = timeseries.tstype_id === 1 ? ' m' : ' ' + timeseries.unit;

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
                {limitDecimalNumbers(row.original.measurement)} {unit}
              </Typography>
              <Typography alignSelf={'center'} variant="caption" color="grey.700" fontWeight="bold">
                {convertDate(row.original.timeofmeas)}
              </Typography>
            </Box>

            <Typography margin="0 auto">
              {correction_map[row.original.useforcorrection] === 'Kontrol'
                ? correction_map[row.original.useforcorrection]
                : 'Korrektion'}
            </Typography>
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
    [unit]
  );

  const options: Partial<MRT_TableOptions<Kontrol>> = {
    renderDetailPanel: ({row}) => (
      <Box sx={renderDetailStyle}>
        {row.original.comment && (
          <Typography>
            <b>Kommentar: </b> {row.original.comment}
          </Typography>
        )}
        <Typography>
          <b>Anvendelse: </b>{' '}
          {correction_map[row.original.useforcorrection]
            ? correction_map[row.original.useforcorrection]
            : 'Kontrol'}
        </Typography>
        <Typography>
          <b>Dato: </b> {convertDateWithTimeStamp(row.original.timeofmeas)}
        </Typography>
      </Box>
    ),
  };

  const table = useTable<Kontrol>(columns, data, options);

  return (
    <Box sx={setTableBoxStyle(320)}>
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
