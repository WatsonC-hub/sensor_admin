import {Box, Dialog, DialogContent, DialogTitle, Typography} from '@mui/material';
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_RowData,
  MRT_TableOptions,
} from 'material-react-table';
import React, {useMemo, useState} from 'react';

import DeleteAlert from '~/components/DeleteAlert';
import {setTableBoxStyle} from '~/consts';
import {convertDateWithTimeStamp, limitDecimalNumbers} from '~/helpers/dateConverter';
import {AdjustmentTypes, MergeType, TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import {ExcludeData, useExclude} from '~/hooks/query/useExclude';
import {useLevelCorrection} from '~/hooks/query/useLevelCorrection';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import {useYRangeMutations} from '~/hooks/query/useYRangeMutations';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useTable} from '~/hooks/useTable';
import ExcludeRow from '~/pages/admin/kvalitetssikring/components/ExcludeRow';
import LevelCorrectionRow from '~/pages/admin/kvalitetssikring/components/LevelCorrectionRow';
import YRangeRow from '~/pages/admin/kvalitetssikring/components/YRangeRow';
import {DataExclude, LevelCorrection, MinMaxCutoff} from '~/types';

import {CertifyQa} from '../api/useCertifyQa';

type AdjustmentData = {
  type: AdjustmentTypes;
  data: DataExclude | LevelCorrection | MinMaxCutoff | CertifyQa;
};

type Props = {
  data: Array<AdjustmentData> | undefined;
};

const AdjustmentDataTable = ({data}: Props) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const {del: delCorrection} = useLevelCorrection();
  const {del: delExclude} = useExclude();
  const {del: delMinMax} = useYRangeMutations();
  const [gid, setGid] = useState<number>();
  const [id, setId] = useState<number>();
  const [type, setType] = useState<string>('');
  const [index, setIndex] = useState<number | undefined>();
  const {isMobile} = useBreakpoints();
  const {data: metadata} = useTimeseriesData();

  // const loc_name = metadata?.loc_name;
  const tstype_id = metadata?.tstype_id;
  const unit = tstype_id === 1 ? ' m' : metadata?.unit;

  const handleDelete = (ts_id: number | undefined, gid: number | undefined, type: string) => {
    if (type === AdjustmentTypes.EXLUDEPOINTS || type === AdjustmentTypes.EXLUDETIME)
      delExclude.mutate({
        path: `${ts_id}/${gid}`,
      });
    else if (type === AdjustmentTypes.LEVELCORRECTION)
      delCorrection.mutate({
        path: `${ts_id}/${gid}`,
      });
    else if (type === AdjustmentTypes.MINMAX)
      delMinMax.mutate({
        path: `${ts_id}`,
      });
  };

  const result = data?.sort((a, b) => {
    const map = new Map<AdjustmentTypes, number>();
    map.set(AdjustmentTypes.EXLUDETIME, 1);
    map.set(AdjustmentTypes.LEVELCORRECTION, 2);
    map.set(AdjustmentTypes.EXLUDEPOINTS, 3);
    map.set(AdjustmentTypes.MINMAX, 4);
    map.set(AdjustmentTypes.APPROVED, 5);

    const mapA = map.get(a.type);
    const mapB = map.get(b.type);
    if (mapA && mapB && mapA < mapB) {
      return -1;
    }
    if (mapA && mapB && mapA > mapB) {
      return 1;
    }

    return 0;
  });

  const columns = useMemo<MRT_ColumnDef<AdjustmentData>[]>(
    () => [
      {
        header: 'Justeringstype',
        accessorFn: (row) => row.type,
        id: 'type',
        size: 100,
      },
      {
        header: 'Indhold',
        accessorFn: (row) => row.data,
        size: 200,
        Cell: ({row}) => {
          if (
            row.original.type === AdjustmentTypes.EXLUDETIME ||
            row.original.type === AdjustmentTypes.EXLUDEPOINTS
          ) {
            const data = row.original.data as DataExclude;
            return (
              <Box>
                {row.original.type === AdjustmentTypes.EXLUDEPOINTS && (
                  <Box>
                    <Typography variant="caption" fontWeight={'bold'}>
                      Område: {'  '}
                    </Typography>
                    <Typography variant="caption" display={'inline-block'}>
                      {limitDecimalNumbers(data.min_value)} {unit}
                    </Typography>
                    {' - '}
                    <Typography variant="caption" display={'inline-block'}>
                      {limitDecimalNumbers(data.max_value)}
                      {unit}
                    </Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" display={'inline-block'}>
                    <b>Fra: </b>
                    {convertDateWithTimeStamp(data.startdate)}
                  </Typography>
                  <Typography variant="caption" display={'inline-block'}>
                    <b>Til: </b>

                    {convertDateWithTimeStamp(data.enddate)}
                  </Typography>
                </Box>
              </Box>
            );
          } else if (row.original.type === AdjustmentTypes.LEVELCORRECTION) {
            const data = row.original.data as LevelCorrection;
            return (
              <Box>
                <Box>
                  <Typography variant="caption" display={'inline-block'}>
                    <b>Dato: </b>
                    {convertDateWithTimeStamp(data.date)}
                  </Typography>
                </Box>
              </Box>
            );
          } else if (row.original.type === AdjustmentTypes.MINMAX) {
            const data = row.original.data as MinMaxCutoff;
            return (
              <Box>
                <Box>
                  {row.original.type === AdjustmentTypes.MINMAX && (
                    <Box display={'flex'} flexDirection={'column'}>
                      <Typography variant="caption">
                        <b>Nedre: </b>
                        {limitDecimalNumbers(data.mincutoff)} {unit}
                      </Typography>
                      <Typography variant="caption">
                        <b>Øvre: </b>
                        {limitDecimalNumbers(data.maxcutoff)} {unit}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          } else if (row.original.type === AdjustmentTypes.APPROVED) {
            const data = row.original.data as CertifyQa;
            return (
              <Box>
                <Box>
                  <Typography variant="caption" display={'inline-block'}>
                    <b>Godkendt til: </b>
                    {convertDateWithTimeStamp(data.date)}
                  </Typography>
                </Box>
              </Box>
            );
          }
        },
      },
      ...(!isMobile
        ? [
            {
              header: 'Kommentar',

              accessorFn: (row: AdjustmentData) => 'comment' in row.data && row.data.comment,
              Cell: ({row}: {row: MRT_RowData}) => {
                if ('comment' in row.original.data) {
                  return <Typography variant="body2">{row.original.data.comment}</Typography>;
                }
              },
            },
          ]
        : []),
    ],
    [isMobile]
  );

  const options: Partial<MRT_TableOptions<AdjustmentData>> = {
    enableGlobalFilter: false,
    enableRowActions: true,
    enableColumnActions: false,
    enableColumnFilters: false,
    enableColumnOrdering: false,
    enablePagination: false,
    enableSorting: false,
    enableStickyHeader: true,
    enableTableFooter: false,
    enableBottomToolbar: false,
    enableCellActions: false,
    enableGlobalFilterRankedResults: false,
    muiTableHeadProps: {
      sx: {
        zIndex: isMobile ? 0 : 2,
      },
    },
    enableTopToolbar: false,
    enableEditing: true,
    editDisplayMode: 'modal',
    muiTableContainerProps: {
      sx: {
        flex: '1 1 1',
        maxHeight: 'fit-content',
      },
    },
    renderEditRowDialogContent: ({row}) => {
      return (
        <Box>
          <Dialog open={editDialogOpen} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Ændre justeringsdata</DialogTitle>
            <DialogContent>
              {(row.original.type === AdjustmentTypes.EXLUDEPOINTS ||
                row.original.type === AdjustmentTypes.EXLUDETIME) && (
                <ExcludeRow
                  data={row.original.data as DataExclude}
                  index={index}
                  isWithYValues={(row.original.data as ExcludeData).min_value !== null}
                  setOpen={() => {
                    setEditDialogOpen(false);
                    table.setEditingRow(null);
                  }}
                />
              )}
              {row.original.type === AdjustmentTypes.LEVELCORRECTION && (
                <LevelCorrectionRow
                  data={row.original.data as LevelCorrection}
                  index={index}
                  setOpen={() => {
                    setEditDialogOpen(false);
                    table.setEditingRow(null);
                  }}
                />
              )}
              {row.original.type === AdjustmentTypes.MINMAX && (
                <YRangeRow
                  data={row.original.data as MinMaxCutoff}
                  setOpen={() => {
                    setEditDialogOpen(false);
                    table.setEditingRow(null);
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </Box>
      );
    },
    renderRowActions: ({row, staticRowIndex}) =>
      row.original.type !== AdjustmentTypes.APPROVED && (
        <RenderActions
          handleEdit={() => {
            setEditDialogOpen(true);
            setType(row.original.type);
            setIndex(staticRowIndex);
            table.setEditingRow(row);
          }}
          disabled={false}
          onDeleteBtnClick={() => {
            setDialogOpen(true);
            setType(row.original.type);
            //@ts-expect-error gid and ts_id is in all but approved
            setGid(row.original.data.gid);
            //@ts-expect-error gid and ts_id is in all but approved
            setId(row.original.data.ts_id);
          }}
        />
      ),
  };

  const table = useTable<AdjustmentData>(
    columns,
    result ?? [],
    options,
    undefined,
    TableTypes.TABLE,
    MergeType.RECURSIVEMERGE
  );

  return (
    <Box sx={isMobile ? {} : setTableBoxStyle(665)}>
      <DeleteAlert
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={() => handleDelete(id, gid, type)}
      />
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default AdjustmentDataTable;
