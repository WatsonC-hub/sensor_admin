import {useMemo, useState} from 'react';
import RenderActions from '~/helpers/RowActions';
import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import DeleteAlert from '~/components/DeleteAlert';
import {convertDateWithTimeStamp, limitDecimalNumbers} from '~/helpers/dateConverter';
import React from 'react';
import {stamdataStore} from '~/state/store';
import {useTable} from '~/hooks/useTable';

export type Kontrol = {
  comment: string;
  gid: number;
  measurement: number;
  timeofmeas: string;
  useforcorrection: number;
};

interface Props {
  data: Kontrol[];
  handleEdit: ({}) => void;
  handleDelete: (gid: number | undefined) => void;
  canEdit: boolean;
  correction_map: Record<number, string>;
}

export default function PejlingMeasurementsTableDesktop({
  data,
  handleEdit,
  handleDelete,
  canEdit,
  correction_map,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);
  const [timeseries] = stamdataStore((state) => [state.timeseries]);

  const unit = timeseries.tstype_id === 1 ? 'Pejling (nedstik) [m]' : `Måling [${timeseries.unit}]`;

  const onDeleteBtnClick = (id: number) => {
    setMpId(id);
    setDialogOpen(true);
  };

  const columns = useMemo<MRT_ColumnDef<Kontrol>[]>(
    () => [
      {
        accessorFn: (row) => convertDateWithTimeStamp(row.timeofmeas),
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
      },
      {
        accessorKey: 'comment',
        header: 'Kommentar',
      },
    ],
    [unit]
  );

  const options: Partial<MRT_TableOptions<Kontrol>> = {
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

  const table = useTable<Kontrol>(columns, data, options);

  return (
    <>
      <DeleteAlert
        measurementId={mpId}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={handleDelete}
      />
      <MaterialReactTable table={table} />
    </>
  );
}
