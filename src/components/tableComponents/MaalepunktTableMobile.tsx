import {Box, Typography} from '@mui/material';
import {
  MRT_ColumnDef,
  MRT_ExpandButton,
  MRT_TableOptions,
  MaterialReactTable,
} from 'material-react-table';
import React, {useMemo, useState} from 'react';

import DeleteAlert from '~/components/DeleteAlert';
import {renderDetailStyle, setTableBoxStyle} from '~/consts';
import useJupiterMaalepunkt from '~/features/station/api/useJupiterMaalepunkt';
import {
  convertDate,
  checkEndDateIsUnset,
  convertDateWithTimeStamp,
  limitDecimalNumbers,
} from '~/helpers/dateConverter';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import {useTable} from '~/hooks/useTable';
import {Maalepunkt, MaalepunktTableData} from '~/types';

interface Props {
  handleEdit: (maalepunkt: Maalepunkt) => void;
  handleDelete: (gid: number | undefined) => void;
  disabled: boolean;
}

export default function MaalepunktTableMobile({handleEdit, handleDelete, disabled}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState<number>(-1);
  const {data: timeseries} = useTimeseriesData();

  const {
    get: {data},
  } = useMaalepunkt();

  const {
    get: {data: jupiterData},
  } = useJupiterMaalepunkt();

  const merged_data = useMemo(() => {
    if (!data) return jupiterData || [];
    if (!jupiterData) return data || [];
    return [...jupiterData, ...data];
  }, [data, jupiterData]);

  const onDeleteBtnClick = (id: number) => {
    setMpId(id);
    setDialogOpen(true);
  };

  const unit = timeseries?.tstype_id === 1 ? ' m' : ` [${timeseries?.unit}]`;

  const columns = useMemo<MRT_ColumnDef<Maalepunkt | MaalepunktTableData>[]>(
    () => [
      {
        accessorFn: (row) => row,
        id: 'content',
        header: 'Indhold',
        enableHide: false,
        Cell: ({row, table, staticRowIndex}) => (
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{width: '100%'}}
            gap={1}
            height={26}
          >
            <MRT_ExpandButton
              sx={{justifyContent: 'left'}}
              row={row}
              table={table}
              staticRowIndex={staticRowIndex}
            />
            <Box display="flex" justifyContent="space-between">
              <Typography width={50} alignSelf={'center'} variant="caption" fontWeight="bold">
                {limitDecimalNumbers(row.original.elevation)} {unit}
              </Typography>
            </Box>
            <Typography margin={'0 auto'} alignSelf={'center'} variant="caption">
              <b>Start: </b> {convertDate(row.original.startdate)}
              {row.original.enddate && (
                <>
                  <br />
                  <b>Slut: </b>
                  {checkEndDateIsUnset(row.original.enddate)
                    ? 'Nu'
                    : convertDate(row.original.enddate)}
                </>
              )}
            </Typography>
            <Box marginLeft={'auto'}>
              <RenderActions
                handleEdit={() => {
                  handleEdit(row.original as Maalepunkt);
                }}
                onDeleteBtnClick={() => {
                  onDeleteBtnClick(row.original.gid);
                }}
                disabled={disabled || 'organisationid' in row.original}
              />
            </Box>
          </Box>
        ),
      },
    ],
    [unit, disabled, handleEdit, jupiterData]
  );

  const options: Partial<MRT_TableOptions<Maalepunkt | MaalepunktTableData>> = {
    localization: {noRecordsToDisplay: 'Ingen målepunkter at vise'},
    renderDetailPanel: ({row}) => (
      <Box sx={renderDetailStyle}>
        <Typography>
          <b>Start dato: </b> {convertDateWithTimeStamp(row.original.startdate)}
        </Typography>
        {row.original.enddate && (
          <Typography>
            <b>Slut dato: </b>
            {checkEndDateIsUnset(row.original.enddate)
              ? 'Nu'
              : convertDateWithTimeStamp(row.original.enddate)}
          </Typography>
        )}
        {(row.original.display_name || row.index === 0) && (
          <Typography>
            <b>Oprettet af:</b> {row.original.display_name ?? 'Jupiter'}
          </Typography>
        )}
        {row.original.mp_description && (
          <Typography>
            <b>Beskrivelse:</b> {row.original.mp_description}
          </Typography>
        )}
      </Box>
    ),
  };

  const table = useTable<Maalepunkt | MaalepunktTableData>(
    columns,
    merged_data,
    options,
    undefined,
    TableTypes.LIST,
    MergeType.RECURSIVEMERGE
  );

  return (
    <Box sx={data && data.length > 4 ? setTableBoxStyle(320) : {}} width={'100%'}>
      <DeleteAlert
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={() => handleDelete(mpId)}
      />
      <MaterialReactTable table={table} />
    </Box>
  );
}
