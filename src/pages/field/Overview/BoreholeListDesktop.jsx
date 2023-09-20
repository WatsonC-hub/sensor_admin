import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import {Grid, VirtualTable, TableHeaderRow} from '@devexpress/dx-react-grid-material-ui';
import {TextField} from '@mui/material';
import useWindowDimensions from '../../../hooks/useWindowDimensions';
import {atom, useAtom} from 'jotai';

const typeAheadAtom = atom('');

const Cell = (props) => {
  const navigate = useNavigate();
  const {column} = props;
  return (
    <VirtualTable.Cell
      {...props}
      style={{cursor: 'pointer'}}
      onClick={(e) => {
        let boreholeno = props.row.boreholeno;

        navigate(`borehole/${boreholeno}`);
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
  {name: 'boreholeno', title: 'DGU. NR.'},
  {name: 'plantid', title: 'Anlægs ID'},
  {name: 'comments', title: 'Kommentar'},
];

export default function BoreholeListDesktop({data, loading}) {
  const [typeAhead, settypeAhead] = useAtom(typeAheadAtom);
  const {height, width} = useWindowDimensions();

  var rows = [];
  if (!loading && data) {
    rows = data
      ?.map((elem, index) => {
        return {
          ...elem,
          plantid: elem.plantid,
          boreholeno: elem.boreholeno,
          id: index,
        };
      })
      .filter((elem) => {
        return (
          elem.plantid?.toString().toLowerCase().includes(typeAhead.toLowerCase()) ||
          elem.boreholeno?.toLowerCase().includes(typeAhead.toLowerCase())
        );
      });
  }

  return (
    <div>
      <TextField
        variant="outlined"
        label={'Filtrer boringer'}
        InputLabelProps={{shrink: true}}
        placeholder="Søg"
        value={typeAhead}
        onChange={(event) => settypeAhead(event.target.value)}
        style={{marginBottom: 12}}
      />
      <Paper>
        <Grid rows={rows} columns={columns}>
          <VirtualTable
            height={height - 330}
            cellComponent={Cell}
            messages={{noData: 'Ingen data'}}
          />
          {loading && <CircularProgress />}
          <TableHeaderRow titleComponent={TitleCell} />
        </Grid>
      </Paper>
    </div>
  );
}
