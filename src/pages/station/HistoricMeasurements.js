import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

function createData(name, calories, fat, carbs) {
  return { name, calories, fat, carbs };
}

const rows = [
  createData('2020-12-10', 0.255, 0, "kommentar"),
  createData('2020-12-09', 0.255, 1, "kommentar"),
  createData('2020-12-08', 0.255,2, "kommentar"),
  createData('2020-12-07', 0.255, 3, "kommentar"),
  createData('2020-12-06', 0.255, 4, "kommentar"),
];

export default function BasicTable() {
  const classes = useStyles();

  return (
      <>
      <Typography variant="h6">Tidligere pejlinger</Typography>
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Dato</TableCell>
            <TableCell align="right">Pejling</TableCell>
            <TableCell align="right">Anvendelse</TableCell>
            <TableCell align="right">Kommentar</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="right">{row.calories}</TableCell>
              <TableCell align="right">{row.fat}</TableCell>
              <TableCell align="right">{row.carbs}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </>
  );
}