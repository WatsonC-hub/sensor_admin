import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircularProgress from '@mui/material/CircularProgress';
import {Grid, VirtualTable, TableHeaderRow} from '@devexpress/dx-react-grid-material-ui';
import {TextField, Tooltip} from '@mui/material';
import useWindowDimensions from '../../../hooks/useWindowDimensions';
import SignalCellularConnectedNoInternet0BarRoundedIcon from '@mui/icons-material/SignalCellularConnectedNoInternet0BarRounded';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import HeightIcon from '@mui/icons-material/Height';
import {useTheme} from '@mui/material/styles';
import {atom, useAtom} from 'jotai';

const typeAheadAtom = atom('');

const RowDetail = ({row}) => (
  <List>
    <ListItem>
      <b>Location ID: </b>
      {row.locid}
    </ListItem>
    <ListItem>
      <b>Station ID: </b>
      {row.stationid}
    </ListItem>
  </List>
);

const getStatusComp = (status, active, task) => {
  //console.log(status);
  if (!active) {
    return <CheckCircleIcon style={{color: 'grey'}} />;
  }
  switch (task) {
    case 'Ok':
      return <CheckCircleIcon style={{color: 'mediumseagreen'}} />;
    case null:
      return <CheckCircleIcon style={{color: 'mediumseagreen'}} />;
    case 'Sender ikke':
    case 'Sender null':
      return <SignalCellularConnectedNoInternet0BarRoundedIcon style={{color: status}} />;
    case 'Batterskift':
      return <BatteryAlertIcon style={{color: status}} />;
    case 'Tilsyn':
      return <BuildRoundedIcon style={{color: status}} />;
    case 'Pejling':
      return <HeightIcon style={{color: status}} />;
    default:
      return <PriorityHighIcon style={{color: status}} />;
  }
};

const StatusCell = ({color, style, ...restProps}) => {
  return (
    <VirtualTable.Cell {...restProps}>
      <Tooltip title={restProps.row.opgave}>
        {getStatusComp(restProps.row.color, restProps.row.active, restProps.row.opgave)}
      </Tooltip>
    </VirtualTable.Cell>
  );
};

const Cell = (props) => {
  const navigate = useNavigate();
  const {column} = props;
  if (column.name === 'color') {
    return <StatusCell {...props} />;
  }
  return (
    <VirtualTable.Cell
      {...props}
      style={{cursor: 'pointer'}}
      onClick={(e) => {
        let [loc, stat] = props.row.station_loc_id.split('_');

        navigate(`location/${loc}/${stat}`);
      }}
    />
  );
};

const TitleCell = (props) => {
  const {children} = props;
  if (children === 'Redigere') {
    return '';
  }
  return <TableHeaderRow.Title {...props} />;
};

const columns = [
  {name: 'calypso_id', title: 'Calypso ID'},
  {name: 'ts_name', title: 'Stationsnavn'},
  {name: 'tstype_name', title: 'Parameter'},
  // { name: "customer_name", title: "Ejer", width: 200 },
  {
    name: 'color',
    title: 'Status',
  },
];

export default function StationListDesktop({data, loading}) {
  const [typeAhead, settypeAhead] = useAtom(typeAheadAtom);
  const {height, width} = useWindowDimensions();
  const theme = useTheme();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  var rows = [];
  if (!loading) {
    rows = data
      ?.map((elem, index) => {
        var text = elem.opgave;
        switch (elem.color) {
          case '#00FF00':
            text = 'Ok';
            break;
        }
        return {
          ...elem,
          station_loc_id: elem.loc_id + '_' + elem.ts_id,
          id: index,
          opgave: text,
          calypso_id: elem.active ? elem.calypso_id : ' ',
        };
      })
      .filter((elem) => {
        return (
          elem.ts_name.toLowerCase().includes(typeAhead.toLowerCase()) ||
          elem.calypso_id.toString().toLowerCase().includes(typeAhead.toLowerCase())
        );
      });
  }

  return (
    <div>
      <TextField
        variant="outlined"
        label={'Filtrer stationer'}
        InputLabelProps={{shrink: true}}
        placeholder="Søg"
        value={typeAhead}
        onChange={(event) => settypeAhead(event.target.value)}
        style={{marginBottom: 12}}
      />
      <Paper>
        <Grid rows={rows} columns={columns}>
          {/* <LocationTypeProvider for={["station_loc_id"]} /> */}
          {/* <RowDetailState defaultExpandedRowIds={[]} /> */}
          <VirtualTable
            height={height - 330}
            cellComponent={Cell}
            messages={{noData: 'Ingen data'}}
            // columnExtensions={column_extension}
          />
          {loading && <CircularProgress />}
          <TableHeaderRow titleComponent={TitleCell} />
          {/* <TableRowDetail contentComponent={RowDetail} /> */}
        </Grid>
      </Paper>
    </div>
  );
}
