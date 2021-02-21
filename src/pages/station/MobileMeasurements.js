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
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import DeleteAlert from "./DeleteAlert";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
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
        <List>
          {measurements.map((row, index) => (
            //   <Card className={classes.root} variant='outlined'>
            //     <CardHeader subheader={row.properties.timeofmeas} />
            //     <CardContent>

            //       <div
            //         style={{
            //           display: "flex",
            //           flexDirection: "row",
            //           justifyContent: "space-between",
            //         }}
            //       >
            //         <Typography>
            //           pejling: {row.properties.disttowatertable_m}
            //         </Typography>
            //         <Typography>
            //           Anvendelse: {row.properties.useforcorrection}
            //         </Typography>
            //       </div>
            //       <Typography>{row.properties.comment}</Typography>
            //     </CardContent>
            //     <CardActions>
            //       <Button
            //         size='small'
            //         color='primary'
            //         onClick={() => handleEdit(row.properties)}
            //       >
            //         Edit
            //       </Button>
            //       <Button
            //         size='small'
            //         color='primary'
            //         onClick={() => onDeleteBtnClick(row.properties.gid)}
            //       >
            //         Delete
            //       </Button>
            //     </CardActions>
            //   </Card>
            // <ListItem>
            //   <div
            //     style={{
            //       display: "flex",
            //       flexDirection: "row",
            //       justifyContent: "space-between",
            //     }}
            //   >
            //     <span>{row.properties.timeofmeas.substr(0, 10)}</span>
            //     <span>{row.properties.disttowatertable_m}</span>
            //     <span>{row.properties.useforcorrection}</span>
            //   </div>
            // </ListItem>
            <ListItem dense>
              <ListItemText
                primary={row.properties.timeofmeas}
                secondary={
                  "pejling:" +
                  row.properties.disttowatertable_m +
                  "\u00a0\u00a0\u00a0\u00a0anv: " +
                  row.properties.useforcorrection
                }
              />

              {/* <ListItemText
                secondary={row.properties.timeofmeas.substr(0, 10)}
              />
              <ListItemText
                secondary={row.properties.timeofmeas.substr(0, 10)}
              /> */}
              <ListItemSecondaryAction>
                <IconButton
                  edge='end'
                  onClick={() => {
                    //window.scrollTo({ top: 0, behavior: "smooth" });
                    handleEdit(row.properties);
                    setTimeout(() => {
                      window.scrollTo({ top: 300, behavior: "smooth" });
                    }, 200);
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge='end'
                  onClick={() => onDeleteBtnClick(row.properties.gid)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </>
    </>
  );
}
