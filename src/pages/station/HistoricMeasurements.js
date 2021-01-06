import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { Typography } from "@material-ui/core";
import { getMeasurements } from "../../api";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

function createData(name, calories, fat, carbs) {
  return { name, calories, fat, carbs };
}

const columns = [];

const rows = [
  createData("2020-12-10", 0.255, 0, "kommentar"),
  createData("2020-12-09", 0.255, 1, "kommentar"),
  createData("2020-12-08", 0.255, 2, "kommentar"),
  createData("2020-12-07", 0.255, 3, "kommentar"),
  createData("2020-12-06", 0.255, 4, "kommentar"),
];

export default function HistoricMeasurements({ stationId }) {
  const classes = useStyles();
  const [measurements, setMeasurements] = useState([]);

  useEffect(() => {
    if (stationId < 0) return;
    getMeasurements(stationId).then((res) => {
      console.log(res);
      setMeasurements(res.data.features);
    });
  }, [stationId]);

  return (
    <>
      <Typography gutterBottom variant='h5' component='h2'>
        Tidligere pejlinger
      </Typography>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label='simple table'>
          <TableHead>
            <TableRow>
              <TableCell>Dato</TableCell>
              <TableCell align='right'>Pejling</TableCell>
              <TableCell align='right'>Anvendelse</TableCell>
              <TableCell align='right'>Kommentar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {measurements.map((row) => (
              <TableRow key={row.properties.gid}>
                <TableCell component='th' scope='row'>
                  {row.properties.timeofmeas}
                </TableCell>
                <TableCell align='right'>
                  {row.properties.disttowatertable_m}
                </TableCell>
                <TableCell align='right'>
                  {row.properties.useforcorrection}
                </TableCell>
                <TableCell align='right'>{row.properties.comment}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
