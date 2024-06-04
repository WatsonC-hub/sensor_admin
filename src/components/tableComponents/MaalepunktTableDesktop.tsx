import {Typography} from '@mui/material';
import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import {useMemo, useState} from 'react';

import DeleteAlert from '~/components/DeleteAlert';
import {convertDate, checkEndDateIsUnset, limitDecimalNumbers} from '~/helpers/dateConverter';
import RenderActions from '~/helpers/RowActions';
import {useTable} from '~/hooks/useTable';
import {stamdataStore} from '~/state/store';

export type Maalepunkt = {
  startdate: string;
  enddate: string;
  elevation: number;
  mp_description: string;
  gid: number;
  ts_id: number;
  userid: string;
};

interface Props {
  data: Maalepunkt[] | undefined;
  handleEdit: (maalepunkt: Maalepunkt) => void;
  handleDelete: (gid: number | undefined) => void;
  canEdit: boolean;
}

export default function MaalepunktTableDesktop({data, handleEdit, handleDelete, canEdit}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);
  const [timeseries] = stamdataStore((state) => [state.timeseries]);

  const onDeleteBtnClick = (id: number) => {
    setMpId(id);
    setDialogOpen(true);
  };

  const unit = timeseries.tstype_id === 1 ? 'Pejling (nedstik) [m]' : `Måling [${timeseries.unit}]`;

  const columns = useMemo<MRT_ColumnDef<Maalepunkt>[]>(
    () => [
      {
        accessorFn: (row) => (
          <Typography sx={{display: 'inline', justifySelf: 'flex-end'}}>
            {convertDate(row.startdate)} {' - '}
            {checkEndDateIsUnset(row.enddate) ? 'Nu' : convertDate(row.enddate)}
          </Typography>
        ),
        id: 'startdate',
        header: 'Dato',
        enableHide: false,
      },
      {
        accessorFn: (row) => limitDecimalNumbers(row.elevation),
        header: unit,
        id: 'elevation',
      },
      {
        header: 'Beskrivelse',
        accessorKey: 'mp_description',
      },
    ],
    [unit]
  );

  const options: Partial<MRT_TableOptions<Maalepunkt>> = {
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

  const table = useTable<Maalepunkt>(columns, data, options);

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
