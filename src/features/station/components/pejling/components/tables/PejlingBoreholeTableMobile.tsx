import {Box, Typography} from '@mui/material';
import {
  MRT_ColumnDef,
  MRT_TableOptions,
  MRT_ExpandButton,
  MaterialReactTable,
} from 'material-react-table';
import React, {useMemo, useState} from 'react';

import DeleteAlert from '~/components/DeleteAlert';
import {renderDetailStyle, correction_map} from '~/consts';
import {usePejling} from '~/features/pejling/api/usePejling';
import {convertDate, convertDateWithTimeStamp, limitDecimalNumbers} from '~/helpers/dateConverter';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import {useQueryTable} from '~/hooks/useTable';
import {boreholePejlingItem} from '~/types';

interface Props {
  handleEdit: (kontrol: boreholePejlingItem) => void;
  handleDelete: (gid: number) => void;
  disabled: boolean;
}

export default function PejlingBoreholeTableMobile({handleEdit, handleDelete, disabled}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);
  const {data: timeseries} = useTimeseriesData();
  const tstype_id = timeseries?.tstype_id;
  const stationUnit = timeseries?.unit;
  const unit = tstype_id === 1 ? ' m' : ' ' + stationUnit;
  const isWaterlevel = tstype_id === 1;

  const onDeleteBtnClick = (id: number) => {
    setMpId(id);
    setDialogOpen(true);
  };

  const {get} = usePejling();

  const columns = useMemo<MRT_ColumnDef<boreholePejlingItem>[]>(
    () => [
      {
        accessorFn: (row) => row,
        id: 'content',
        header: 'Indhold',
        enableHide: false,
        Cell: ({row, table, staticRowIndex}) => (
          <Box
            style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
            sx={{width: '100%'}}
            gap={1}
            height={26}
          >
            <MRT_ExpandButton row={row} table={table} staticRowIndex={staticRowIndex} />
            <Box display="flex" flexDirection={'column'}>
              <Typography alignSelf={'center'} variant="caption" fontWeight="bold">
                {row.original.measurement === null
                  ? 'Ingen måling'
                  : `${limitDecimalNumbers(row.original.measurement)} ${unit}`}
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
                disabled={disabled}
              />
            </Box>
          </Box>
        ),
      },
    ],
    [unit, disabled, handleEdit]
  );

  const options: Partial<MRT_TableOptions<boreholePejlingItem>> = {
    localization: {noRecordsToDisplay: 'Ingen kontrolmålinger at vise'},
    renderDetailPanel: ({row}) => (
      <Box sx={renderDetailStyle}>
        {row.original.comment && (
          <Typography>
            <b>Kommentar: </b> {row.original.comment}
          </Typography>
        )}
        {isWaterlevel && (
          <Typography>
            <b>Kote [m DVR90]: </b> {limitDecimalNumbers(row.original.referenced_measurement)}{' '}
            {unit}
          </Typography>
        )}
        {row.original.pumpstop && (
          <Typography>
            <b>Pumpestop: </b> {convertDateWithTimeStamp(row.original.pumpstop)} {unit}
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
        {row.original.display_name && (
          <Typography>
            <b>Oprettet af: </b> {row.original.display_name}
          </Typography>
        )}
      </Box>
    ),
  };

  const table = useQueryTable<boreholePejlingItem>(
    columns,
    get,
    options,
    undefined,
    TableTypes.LIST,
    MergeType.RECURSIVEMERGE
  );

  return (
    <>
      <DeleteAlert
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={() => handleDelete(mpId)}
      />
      <Box>
        <MaterialReactTable table={table} />
      </Box>
    </>
  );
}
