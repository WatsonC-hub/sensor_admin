import {Box} from '@mui/material';
import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import {MRT_Localization_DA} from 'material-react-table/locales/da';
import React, {useEffect, useMemo, useState} from 'react';

import DeleteAlert from '~/components/DeleteAlert';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import {correction_map} from '~/consts';
import {convertDateWithTimeStamp, limitDecimalNumbers} from '~/helpers/dateConverter';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import {useStatefullTableAtom} from '~/hooks/useStatefulTableAtom';
import {useTable} from '~/hooks/useTable';
import {stamdataStore} from '~/state/store';
import {PejlingItem} from '~/types';

interface Props {
  data: PejlingItem[] | undefined;
  handleEdit: (kontrol: PejlingItem) => void;
  handleDelete: (gid: number | undefined) => void;
  canEdit: boolean;
  error?: string;
}

export default function PejlingMeasurementsTableDesktop({
  data,
  handleEdit,
  handleDelete,
  canEdit,
  error,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);
  const [timeseries] = stamdataStore((state) => [state.timeseries]);
  const [height, setHeight] = useState<number>();

  const unit = timeseries.tstype_id === 1 ? 'Pejling (nedstik) [m]' : `Måling [${timeseries.unit}]`;

  const onDeleteBtnClick = (id: number) => {
    setMpId(id);
    setDialogOpen(true);
  };

  useEffect(() => {
    if (data) setHeight((data.length > 10 ? 10 * 65 : data.length * 65) + 56 + 71 + 56);
  }, [data]);

  const columns = useMemo<MRT_ColumnDef<PejlingItem>[]>(
    () => [
      {
        accessorFn: (row) => convertDateWithTimeStamp(row.timeofmeas),
        sortingFn: (a, b) => (a.original.timeofmeas > b.original.timeofmeas ? 1 : -1),
        id: 'timeofmeas',
        header: 'Dato',
      },
      {
        accessorFn: (row) => limitDecimalNumbers(row.measurement),
        header: unit,
        id: 'measurement',
      },
      {
        accessorFn: (row) =>
          correction_map[row.useforcorrection] ? correction_map[row.useforcorrection] : 'Kontrol',
        header: 'Anvendelse',
        id: 'useforcorrection',
        enableColumnFilter: true,
      },
      {
        accessorKey: 'comment',
        header: 'Kommentar',
        enableColumnFilter: false,
      },
    ],
    [unit]
  );

  const [tableState, reset] = useStatefullTableAtom<PejlingItem>('PejlingTableState');

  const options: Partial<MRT_TableOptions<PejlingItem>> = {
    localization: error ? {noRecordsToDisplay: error} : MRT_Localization_DA,
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

  const table = useTable<PejlingItem>(
    columns,
    data,
    options,
    tableState,
    TableTypes.TABLE,
    MergeType.RECURSIVEMERGE
  );

  return (
    <Box height={height}>
      <DeleteAlert
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={() => handleDelete(mpId)}
      />
      <MaterialReactTable table={table} />
    </Box>
  );
}
