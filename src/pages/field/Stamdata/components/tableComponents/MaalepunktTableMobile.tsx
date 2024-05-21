import {ExpandCircleDown} from '@mui/icons-material';
import {Box, IconButton, Typography} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {MRT_ColumnDef} from 'material-react-table';
import {useMemo, useState} from 'react';
import {getDefaultMRTOptionsMobile} from '~/helpers/getMaterialReactOptionsMobile';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteAlert from '~/components/DeleteAlert';
import {convertDate, checkEndDateIsUnset, convertDateWithTimeStamp} from '~/helpers/dateConverter';
import FormTableComponent from '~/components/FormTableComponent';

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

export default function MaalepunktTableMobile({data, handleEdit, handleDelete, canEdit}: Props) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);
  const getOptions = getDefaultMRTOptionsMobile<Maalepunkt>();

  const onDeleteBtnClick = (id: number) => {
    setMpId(id);
    setDialogOpen(true);
  };

  const columns = useMemo<MRT_ColumnDef<Maalepunkt>[]>(
    () => [
      {
        accessorFn: (row) => (
          <Box display="flex" justifyContent="space-between" gap={1}>
            <Typography display="flex" justifySelf="flex-start" alignSelf="center">
              {row.elevation} m
            </Typography>
            <Typography sx={{display: 'inline', justifySelf: 'flex-end'}}>
              <b>Start: </b> {convertDate(row.startdate)}
              <br />
              <b>Slut: </b> {checkEndDateIsUnset(row.enddate) ? 'Nu' : convertDate(row.enddate)}
            </Typography>
          </Box>
        ),
        id: 'startdate',
        header: 'Date',
        enableHide: false,
        Cell: ({row, table}) => (
          <Box display="flex" justifyContent="space-between">
            <Box display="flex" sx={{justifyContent: 'flex-start'}}>
              <IconButton onClick={() => row.toggleExpanded(!row.getIsExpanded())}>
                <ExpandCircleDown />
              </IconButton>
            </Box>
            <Box display="flex" justifyContent="flex-end">
              {row.getValue('startdate')}
              <IconButton
                edge="end"
                onClick={() => {
                  handleEdit(row.original);
                }}
                disabled={!canEdit}
                size="large"
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                onClick={() => {
                  console.log(row.original.gid);
                  onDeleteBtnClick(row.original.gid);
                }}
                disabled={!canEdit}
                size="large"
                style={{marginRight: '2px'}}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        ),
      },
    ],
    []
  );

  const options = {
    enableTableHead: false,
    enableExpanding: true,
    muiTableBodyCellProps: {
      sx: {
        borderRadius: 9999,
        border: 'none',
        backgroundColor: 'grey.300',
      },
    },
    muiTablePaperProps: {
      sx: {
        boxShadow: 'none',
        p: 0,
        margin: 'auto',
      },
    },
    muiTableFooterProps: {
      sx: {
        boxShadow: 'none',
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
    muiTableProps: {
      sx: {
        borderSpacing: 5,
        border: 'none',
      },
    },
    muiPaginationProps: {
      showRowsPerPage: false,
    },
    renderDetailPanel: ({row}: any) => (
      <Box sx={{border: 'none'}}>
        <Typography>
          <b>Beskrivelse:</b> {row.original.mp_description}
        </Typography>
        <Typography>
          <b>Start dato: </b> {convertDateWithTimeStamp(row.original.startdate)}
        </Typography>
        <Typography>
          <b>Slut dato: </b>
          {checkEndDateIsUnset(row.original.enddate)
            ? 'Nu'
            : convertDateWithTimeStamp(row.original.enddate)}
        </Typography>
      </Box>
    ),
    initialState: {
      density: 'compact',
      columnVisibility: {
        'mrt-row-expand': false,
      },
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
