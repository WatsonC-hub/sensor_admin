import {useMemo, useState} from 'react';
import FormTableComponent from '~/components/FormTableComponent';
import RenderActions from '~/helpers/RowActions';
import {MRT_ColumnDef} from 'material-react-table';
import DeleteAlert from '~/components/DeleteAlert';
import {convertDateWithTimeStamp} from '~/helpers/dateConverter';

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
  data: Kontrol[];
  handleEdit: ({}) => void;
  handleDelete: (gid: number | undefined) => void;
  canEdit: boolean;
}

export default function PejlingMeasurementsTableDesktop({
  data,
  handleEdit,
  handleDelete,
  canEdit,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);

  const correction_map: any = {
    0: 'Kontrol',
    1: 'Korrektion fremadrettet',
    2: 'Korrektion frem og tilbage til start af tidsserie',
    3: 'Lineær',
    4: 'Korrektion frem og tilbage til udstyr',
    5: 'Korrektion frem og tilbage til niveau spring',
    6: 'Korrektion frem og tilbage til forrige spring',
  };

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
        accessorFn: (row) => row.measurement + ' m',
        header: 'Pejling',
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
    []
  );

  const options = {
    renderRowActions: ({row, table}: any) =>
      RenderActions({handleEdit, onDeleteBtnClick, canEdit}, {row, table}),
    muiTablePaperProps: {
      sx: {
        boxShadow: '1',
        p: 0,
        margin: 'auto',
      },
    },
    muiTableBodyRowProps: {
      sx: {
        '&:hover': {
          td: {
            '&:after': {
              backgroundColor: 'transparent',
            },
          },
        },
      },
    },
    muiPaginationProps: {
      showRowsPerPage: false,
    },
    initialState: {
      density: 'comfortable',
    },
  };

  return (
    <>
      <DeleteAlert
        measurementId={mpId}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={handleDelete}
      />
      <FormTableComponent columns={columns} data={data} options={options} />
    </>
  );
}
