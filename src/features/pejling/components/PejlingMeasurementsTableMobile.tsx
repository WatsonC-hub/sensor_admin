import {Box, Typography} from '@mui/material';
import type {MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import {MRT_ExpandButton, MaterialReactTable} from 'material-react-table';
import React, {useMemo, useState} from 'react';

import DeleteAlert from '~/components/DeleteAlert';
import {renderDetailStyle, correction_map} from '~/consts';
import {usePejling} from '~/features/pejling/api/usePejling';
import {convertDate, convertDateWithTimeStamp, limitDecimalNumbers} from '~/helpers/dateConverter';
import {MergeType, TableTypes} from '~/helpers/enumHelper';
import RenderActions from '~/helpers/RowActions';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import {useQueryTable} from '~/hooks/useTable';
import {useAppContext} from '~/state/contexts';
import type {PejlingItem} from '~/types';

interface Props {
  handleEdit: (kontrol: PejlingItem) => void;
  disabled: boolean;
}

export default function PejlingMeasurementsTableMobile({handleEdit, disabled}: Props) {
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

  const {get, del: delPejling} = usePejling();
  const {isPending, mutate} = delPejling;
  const {ts_id} = useAppContext(['ts_id']);

  const handleDelete = (gid: number | undefined) => {
    const payload = {path: `${ts_id}/${gid}`};
    mutate(payload, {
      onSuccess: () => {
        setDialogOpen(false);
      },
    });
  };

  const columns = useMemo<MRT_ColumnDef<PejlingItem>[]>(
    () => [
      {
        accessorFn: (row) => row,
        id: 'content',
        header: 'Indhold',
        enableHide: false,
        Cell: ({row, table, staticRowIndex}) => (
          <Box
            style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
            sx={{
              gap: 1,
              height: 26,
              width: '100%',
            }}
          >
            <MRT_ExpandButton row={row} table={table} staticRowIndex={staticRowIndex} />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  alignSelf: 'center',
                  fontWeight: 'bold',
                }}
              >
                {row.original.measurement === null
                  ? 'Ingen måling'
                  : `${limitDecimalNumbers(row.original.measurement)} ${unit}`}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  alignSelf: 'center',
                  color: 'grey.700',
                  fontWeight: 'bold',
                }}
              >
                {convertDate(row.original.timeofmeas)}
              </Typography>
            </Box>

            <Typography
              sx={{
                margin: '0 auto',
              }}
            >
              {correction_map[row.original.useforcorrection] === 'Kontrol'
                ? correction_map[row.original.useforcorrection]
                : 'Korrektion'}
            </Typography>
            <Box
              sx={{
                marginLeft: 'auto',
              }}
            >
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

  const options: Partial<MRT_TableOptions<PejlingItem>> = {
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

  const table = useQueryTable<PejlingItem>(
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
        loading={isPending}
      />
      <Box>
        <MaterialReactTable table={table} />
      </Box>
    </>
  );
}
