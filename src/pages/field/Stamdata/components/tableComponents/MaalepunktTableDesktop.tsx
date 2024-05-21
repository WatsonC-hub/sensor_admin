import {Box, Typography} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {useMemo, useState} from 'react';
import {convertDate, checkEndDateIsUnset} from '~/helpers/dateConverter';
import FormTableComponent from '~/components/FormTableComponent';
import RenderActions from '~/helpers/RowActions';
import {MRT_ColumnDef} from 'material-react-table';
import DeleteAlert from '~/components/DeleteAlert';

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
  data: Maalepunkt[];
  handleEdit: ({}) => void;
  handleDelete: (gid: number | undefined) => void;
  canEdit: boolean;
}

export default function MaalepunktTableDesktop({data, handleEdit, handleDelete, canEdit}: Props) {
  const theme = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);

  const onDeleteBtnClick = (id: number) => {
    setMpId(id);
    setDialogOpen(true);
  };

  const columns = useMemo<MRT_ColumnDef<Maalepunkt>[]>(
    () => [
      {
        accessorFn: (row) => (
          <Typography sx={{display: 'inline', justifySelf: 'flex-end'}}>
            <b>Start: </b> {convertDate(row.startdate)}
            <br />
            <b>Slut: </b> {checkEndDateIsUnset(row.enddate) ? 'Nu' : convertDate(row.enddate)}
          </Typography>
          //     <Typography sx={{display: 'inline', justifySelf: 'flex-end'}}>
          //     {convertDate(row.startdate)} -{' '}
          //     {checkEndDateIsUnset(row.enddate) ? 'Nu' : convertDate(row.enddate)}
          //   </Typography>
        ),
        id: 'startdate',
        header: 'Dato',
        enableHide: false,
      },
      {
        accessorFn: (row) => row.elevation + ' m',
        header: 'Pejling',
        id: 'elevation',
      },
      {
        header: 'Beskrivelse',
        accessorKey: 'mp_description',
      },
    ],
    []
  );

  const options = {
    renderRowActions: (
      <RenderActions handleEdit={handleEdit} handleDelete={onDeleteBtnClick} canEdit={canEdit} />
    ),
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
