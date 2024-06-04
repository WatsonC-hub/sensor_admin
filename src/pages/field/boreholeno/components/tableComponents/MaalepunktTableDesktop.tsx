import {Typography} from '@mui/material';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import React, {useMemo, useState} from 'react';

import DeleteAlert from '~/components/DeleteAlert';
import {convertDate, checkEndDateIsUnset, limitDecimalNumbers} from '~/helpers/dateConverter';
import RenderActions from '~/helpers/RowActions';
import {useTable} from '~/hooks/useTable';
import {authStore} from '~/state/store';

export type Maalepunkt = {
  startdate: string;
  enddate: string;
  elevation: number;
  organisationid: number;
  organisationname: string;
  mp_description: string;
  gid: number;
  ts_id: number;
  userid: string;
};

interface Props {
  data: Maalepunkt[];
  handleEdit: (maalepuntk: Maalepunkt) => void;
  handleDelete: (gid: number | undefined) => void;
}

export default function MaalepunktTableDesktop({data, handleEdit, handleDelete}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);
  const org_id = authStore((store) => store.org_id);

  const onDeleteBtnClick = (id: number) => {
    setMpId(id);
    setDialogOpen(true);
  };

  //   const unit = timeseries.tstype_id === 1 ? 'Pejling (nedstik) [m]' : `Måling [${timeseries.unit}]`;

  const columns = useMemo<MRT_ColumnDef<Maalepunkt>[]>(
    () => [
      {
        accessorFn: (row) => (
          <Typography sx={{display: 'inline', justifySelf: 'flex-end'}}>
            <b>Start: </b> {convertDate(row.startdate)}
            <br />
            <b>Slut: </b> {checkEndDateIsUnset(row.enddate) ? 'Nu' : convertDate(row.enddate)}
          </Typography>
        ),
        id: 'date',
        header: 'Dato',
        enableHide: false,
      },
      {
        accessorFn: (row) => limitDecimalNumbers(row.elevation),
        header: 'Målepunktskote [m]',
        id: 'elevation',
      },
      {
        accessorKey: 'organisationname',
        header: 'Organisation',
        Cell: ({row}) => (
          <Typography>
            {row.original.organisationid === org_id ? row.original.organisationname : '-'}
          </Typography>
        ),
      },
      {
        header: 'Beskrivelse',
        accessorKey: 'mp_description',
        Cell: ({row}) => <Typography>{row.getValue('mp_description')}</Typography>,
      },
    ],
    []
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
        canEdit={row.original.organisationid == org_id}
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
