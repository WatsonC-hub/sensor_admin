import React, { useEffect, useState, useContext } from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
// import Typography from "@material-ui/core/Typography";
// import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import DeleteAlert from "./DeleteAlert";
import LocationContext from "../../LocationContext";

const useStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)",
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

export default function MobileMeasurements({
  measurements,
  handleEdit,
  handleDelete,
}) {
  const classes = useStyles();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [measurementId, setMeasurementId] = useState(-1);
  const onDeleteBtnClick = (id) => {
    setMeasurementId(id);
    setDialogOpen(true);
  };

  const deleteRow = (id) => {
    handleDelete(id);
  };

  return (
    <>
      <DeleteAlert
        measurementId={measurementId}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={deleteRow}
      />
      <Typography gutterBottom variant='h5' component='h2'>
        Tidligere pejlinger
      </Typography>
      <>
        {measurements.map((row, index) => (
          <Card className={classes.root} variant='outlined'>
            <CardHeader subheader={row.properties.timeofmeas} />
            <CardContent>
              {/* <Typography className={classes.title} variant='h5' component='h2'>
                {row.properties.timeofmeas}
              </Typography> */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Typography>
                  pejling: {row.properties.disttowatertable_m}
                </Typography>
                <Typography>
                  Anvendelse: {row.properties.useforcorrection}
                </Typography>
              </div>
              <Typography>{row.properties.comment}</Typography>
            </CardContent>
            <CardActions>
              <Button
                size='small'
                color='primary'
                onClick={() => handleEdit(row.properties)}
              >
                Edit
              </Button>
              <Button
                size='small'
                color='primary'
                onClick={() => onDeleteBtnClick(row.properties.gid)}
              >
                Delete
              </Button>
            </CardActions>
          </Card>
        ))}
      </>
    </>
  );
}
