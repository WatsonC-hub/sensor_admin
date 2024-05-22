import {ExpandCircleDown} from '@mui/icons-material';
import {Box, IconButton, Typography} from '@mui/material';
import {MRT_ColumnDef} from 'material-react-table';
import {useMemo, useState} from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteAlert from '~/components/DeleteAlert';
import {convertDate, convertDateWithTimeStamp} from '~/helpers/dateConverter';
import FormTableComponent from '~/components/FormTableComponent';

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

export default function PejlingMeasurementsTableMobile({
  data,
  handleEdit,
  handleDelete,
  canEdit,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);

  const onDeleteBtnClick = (id: number) => {
    setMpId(id);
    setDialogOpen(true);
  };

  const correction_map: any = {
    0: 'Kontrol',
    1: 'Korrektion fremadrettet',
    2: 'Korrektion frem og tilbage til start af tidsserie',
    3: 'Lineær',
    4: 'Korrektion frem og tilbage til udstyr',
    5: 'Korrektion frem og tilbage til niveau spring',
    6: 'Korrektion frem og tilbage til forrige spring',
  };

  const columns = useMemo<MRT_ColumnDef<Kontrol>[]>(
    () => [
      {
        accessorFn: (row) => (
          <Box display="flex" marginLeft="auto" gap={1}>
            <Typography display="flex" alignSelf="center">
              {row.measurement} m
            </Typography>
            <Typography sx={{display: 'inline', alignSelf: 'center'}}>
              {convertDate(row.timeofmeas)}
            </Typography>
          </Box>
        ),
        id: 'timeofmeas',
        header: 'Dato',
        enableHide: false,
        Cell: ({row, table}) => (
          <Box style={{display: 'flex', width: '100%', justifyContent: 'space-around'}}>
            <IconButton onClick={() => row.toggleExpanded(!row.getIsExpanded())}>
              <ExpandCircleDown />
            </IconButton>
            <Box display="flex" marginLeft="auto" justifyContent="center">
              {row.getValue('timeofmeas')}
            </Box>
            <Box display="flex" marginLeft="auto">
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
        width: '100%',
        alignContent: 'space-between',
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
          <b>Anvendelse:</b>{' '}
          {correction_map[row.original.useforcorrection]
            ? correction_map[row.original.useforcorrection]
            : 'Kontrol'}
        </Typography>
        <Typography>
          <b>Start dato: </b> {convertDateWithTimeStamp(row.original.timeofmeas)}
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
