import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DirectionsIcon from '@mui/icons-material/Directions';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import StraightenIcon from '@mui/icons-material/Straighten';
import {Box, Tooltip, Typography, Divider} from '@mui/material';
import {
  MRT_ColumnDef,
  MRT_Row,
  MRT_TableOptions,
  MaterialReactTable,
  MRT_TableInstance,
} from 'material-react-table';
import moment from 'moment';
import React, {useMemo} from 'react';

import Button from '~/components/Button';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import {calculateContentHeight, boreholeColors} from '~/consts';
import {convertDateWithTimeStamp} from '~/helpers/dateConverter';
import {TableTypes} from '~/helpers/EnumHelper';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useStatefullTableAtom} from '~/hooks/useStatefulTableAtom';
import {useTable} from '~/hooks/useTable';
import type {BoreholeData} from '~/types';

function statusIcon(row: BoreholeData) {
  let icon;
  const status = row.status;

  if (status == 0 || status == 1) {
    icon = <CheckCircleIcon style={{color: boreholeColors[status].color}} />;
  } else {
    icon = (
      <StraightenIcon
        style={{color: boreholeColors[status].color, strokeWidth: 0.5, stroke: '#aaaaaa'}}
      />
    );
  }

  return (
    <Tooltip arrow title={boreholeColors[status].text} enterTouchDelay={0}>
      {icon}
    </Tooltip>
  );
}

interface Props {
  data?: BoreholeData[];
}

interface MRT_RenderProps {
  row: MRT_Row<BoreholeData>;
  table: MRT_TableInstance<BoreholeData>;
}

const BoreholeTable = ({data}: Props) => {
  const {isTouch} = useBreakpoints();
  const {boreholeIntake} = useNavigationFunctions();

  const [tableState, reset] = useStatefullTableAtom<BoreholeData>('BoreholeTableData');

  const columns = useMemo<MRT_ColumnDef<BoreholeData>[]>(
    () => [
      {
        header: 'Status',
        accessorKey: 'status',
        size: 20,
        Cell: ({row}) => statusIcon(row.original),
      },
      {
        header: 'DGU. Nr.',
        accessorFn: (row) => `${row.boreholeno} - ${row.intakeno}`,
        enableHiding: false,
        size: 20,
        maxSize: 30,
      },
      {
        header: 'Beskrivelse',
        accessorKey: 'description',
        size: 20,
        maxSize: 30,
      },
      ...(isTouch
        ? []
        : ([
            {
              header: 'Anlægsnavn',
              accessorKey: 'plantname',
              size: 20,
              maxSize: 30,
            },
            {
              header: 'Seneste pejling',
              accessorFn: (row) => {
                if (row.timeofmeas) {
                  return `${moment(row.timeofmeas).format('DD-MM-YYYY HH:mm')}`;
                } else {
                  return 'Ingen pejling';
                }
              },
            },
          ] as MRT_ColumnDef<BoreholeData>[])),
      // {
      //   header: 'Årlige kontroller',
      //   accessorKey: 'num_controls_in_a_year',
      // },
    ],
    [isTouch]
  );

  const renderDetailPanel = ({row}: MRT_RenderProps) => (
    <Box
      sx={{
        backgroundColor: row.getIsSelected() ? 'grey.300' : 'inherit',
      }}
    >
      <Box display={'grid'} gridTemplateColumns={'1fr 1fr'}>
        <Typography variant="caption" color="grey.700" fontWeight="bold">
          Anlægs id:{' '}
          <Typography component="span" variant="caption">
            {row.original.plantid}
          </Typography>
        </Typography>
        <Typography variant="caption" color="grey.700" fontWeight="bold">
          Anlægsnavn:{' '}
          <Typography component="span" variant="caption">
            {row.original.plantname}
          </Typography>
        </Typography>
        <Typography variant="caption" color="grey.700" fontWeight="bold">
          Seneste pejling:{' '}
          <Typography component="span" variant="caption">
            {row.original.measurement} m (DVR90) -{' '}
            {convertDateWithTimeStamp(row.original.timeofmeas)}
          </Typography>
        </Typography>
        <Typography variant="caption" color="grey.700" fontWeight="bold">
          Årlige kontroller:{' '}
          <Typography component="span" variant="caption">
            {row.original.num_controls_in_a_year}
          </Typography>
        </Typography>
      </Box>
      <Divider />
      <Box
        display={'flex'}
        alignItems={'center'}
        alignContent={'center'}
        justifyContent={'space-between'}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography
            alignSelf={'center'}
            alignItems="center"
            variant="body2"
            color="grey.700"
            fontWeight="bold"
            gap={1}
          >
            Status:
          </Typography>
          {statusIcon(row.original)}
          <Typography variant="body2">{boreholeColors[row.original.status].text}</Typography>
        </Box>
      </Box>
      <Box display={'flex'} flexDirection={'row'} pb={1} justifyContent={'center'} gap={1}>
        <Button
          bttype="tertiary"
          onClick={() => {
            window.open(
              `https://www.google.com/maps/search/?api=1&query=${row.original.latitude},${row.original.longitude}`,
              '_blank'
            );
          }}
          startIcon={<DirectionsIcon />}
        >
          Google Maps
        </Button>
        <Button
          bttype="primary"
          onClick={() => {
            boreholeIntake(row.original.boreholeno, row.original.intakeno);
          }}
          startIcon={<QueryStatsIcon />}
        >
          Boring
        </Button>
      </Box>
    </Box>
  );

  const options: Partial<MRT_TableOptions<BoreholeData>> = {
    enableExpanding: true,
    enableExpandAll: false,
    renderToolbarInternalActions: ({table}) => {
      return <RenderInternalActions table={table} reset={reset} />;
    },
    muiTableBodyRowProps: ({row}) => {
      return {
        onDoubleClick: () => {
          boreholeIntake(row.original.boreholeno, row.original.intakeno);
        },
      };
    },
    renderDetailPanel: renderDetailPanel,
    muiTableHeadCellProps: {
      sx: {
        flex: '0 0 auto',
        fontSize: '0.8rem',
      },
    },
    muiTableBodyCellProps: {
      sx: {
        px: 0.5,
        flex: '0 0 auto',
        fontSize: '0.8rem',
        textWrap: 'wrap',
      },
    },
  };

  const table = useTable<BoreholeData>(columns, data, options, tableState, TableTypes.STATIONTABLE);

  return (
    <Box
      justifyContent={'center'}
      alignSelf={'center'}
      p={1}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: calculateContentHeight(160),
        minWidth: '50%',
        width: '100%',
        maxWidth: '1080px',
        justifySelf: 'center',
      }}
    >
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default BoreholeTable;
