import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import StraightenIcon from '@mui/icons-material/Straighten';
import {Box, IconButton, Tooltip, Typography} from '@mui/material';
import moment from 'moment';
import React, {useMemo} from 'react';

import TableComponent from '~/components/TableComponent';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {boreholeTableAtom} from '~/state/atoms';

const boreholeColors = {
  1: {
    color: '#66bb6a',
    message: 'Pejlet for nyligt',
  },
  2: {
    color: '#FFFF00',
    message: 'Skal snart pejles',
  },
  3: {
    color: '#FF6C00',
    message: 'Pejling overskredet',
  },
  0: {
    color: '#3388ff',
    message: 'Ok',
  },
};

function statusIcon(row) {
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
    <Tooltip arrow title={boreholeColors[status].message} enterTouchDelay={0}>
      {icon}
    </Tooltip>
  );
}

const BoreholeTable = ({data, isLoading}) => {
  const {isTouch} = useBreakpoints();
  const {boreholeIntake} = useNavigationFunctions();
  const mobileColumns = useMemo(
    () => [
      {
        header: 'DGU. Nr.',
        accessorFn: (row) => `${row.boreholeno} - ${row.intakeno}`,
        enableHiding: false,
        size: 80,
      },
      {
        header: 'Status',
        accessorKey: 'status',
        Cell: ({row}) => statusIcon(row.original),
        size: 20,
      },
    ],
    []
  );

  const columns = useMemo(
    () => [
      {
        header: 'DGU. Nr.',
        accessorFn: (row) => `${row.boreholeno} - ${row.intakeno}`,
        enableHiding: false,
      },
      {
        header: 'Anlægsnavn',
        accessorKey: 'plantname',
      },
      {
        header: 'Beskrivelse',
        accessorKey: 'description',
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
      {
        header: 'Årlige kontroller',
        accessorKey: 'num_controls_in_a_year',
      },
      {
        header: 'Status',
        accessorKey: 'status',
        Cell: ({row}) => statusIcon(row.original),
      },
    ],
    []
  );

  const renderDetailPanel = ({row}) => (
    <Box
      sx={{
        display: 'grid',
        margin: 'auto',
        gridTemplateColumns: '1fr 1fr',
        width: '100%',
      }}
    >
      <Typography>Anlægs id: {row.original.plantid}</Typography>
      <Typography>Anlægsnavn: {row.original.plantname}</Typography>
      <Typography>Seneste pejling: {row.original.measurement}</Typography>
      <Typography>Tidspunkt: {row.original.timeofmeas}</Typography>
      <Typography>Årlige kontroller: {row.original.num_controls_in_a_year}</Typography>
    </Box>
  );

  const rowActions = ({row}) => (
    <Box gap={0.5}>
      <Tooltip arrow title="Gå til boring" enterTouchDelay={0}>
        <IconButton
          size="small"
          sx={{backgroundColor: 'secondary.main'}}
          onClick={() => {
            boreholeIntake(row.original.boreholeno, row.original.intakeno);
            // navigate(`/field/borehole/${row.original.boreholeno}/${row.original.intakeno}`);
          }}
        >
          <QueryStatsIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );

  return (
    <TableComponent
      data={data}
      columns={isTouch ? mobileColumns : columns}
      isLoading={isLoading}
      renderDetailPanel={renderDetailPanel}
      rowActions={rowActions}
      tableStateAtom={boreholeTableAtom}
    />
  );
};

export default BoreholeTable;
