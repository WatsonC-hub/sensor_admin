import React, { useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@material-ui/core";
import "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import daLocale from "date-fns/locale/da";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import { makeStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import LocalityForm from "../Stamdata/components/LocalityForm";
import StationForm from "../Stamdata/components/StationForm";
import UdstyrForm from "../Stamdata/components/UdstyrForm";
import { getStamData } from "../../api";
import { StamdataContext } from "../Stamdata/StamdataContext";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
}));

// function Locality(props) {
//   return (
//     <Grid container spacing={2}>
//       <Grid item xs={12} sm={6}>
//         <TextField
//           variant='outlined'
//           type='text'
//           label='Navn'
//           InputLabelProps={{ shrink: true }}
//           fullWidth
//           margin='dense'
//         />
//       </Grid>
//       <Grid item xs={12} sm={6}>
//         <TextField
//           variant='outlined'
//           type='text'
//           label='X-koordinat (UTM)'
//           InputLabelProps={{ shrink: true }}
//           fullWidth
//           margin='dense'
//         />
//       </Grid>
//       <Grid item xs={12} sm={6}>
//         <TextField
//           variant='outlined'
//           type='text'
//           label='Y-koordinat (UTM)'
//           InputLabelProps={{ shrink: true }}
//           fullWidth
//           margin='dense'
//         />
//       </Grid>
//       <Grid item xs={12} sm={6}>
//         <TextField
//           variant='outlined'
//           type='text'
//           label='Terrænkote'
//           InputLabelProps={{ shrink: true }}
//           fullWidth
//           margin='dense'
//         />
//       </Grid>
//       <Grid item xs={12} sm={6}>
//         <TextField
//           variant='outlined'
//           type='text'
//           label='Terrænkote'
//           InputLabelProps={{ shrink: true }}
//           fullWidth
//           margin='dense'
//         />
//       </Grid>
//       <Grid item xs={12} sm={6}>
//         <TextField
//           variant='outlined'
//           type='text'
//           label='Terrænkote'
//           InputLabelProps={{ shrink: true }}
//           fullWidth
//           margin='dense'
//         />
//       </Grid>
//       <Grid item xs={12} sm={6}>
//         <TextField
//           variant='outlined'
//           type='text'
//           label='Terrænkote'
//           InputLabelProps={{ shrink: true }}
//           fullWidth
//           margin='dense'
//         />
//       </Grid>
//       <Grid item xs={12} sm={6}>
//         <TextField
//           variant='outlined'
//           type='text'
//           label='Terrænkote'
//           InputLabelProps={{ shrink: true }}
//           fullWidth
//           margin='dense'
//         />
//       </Grid>
//       <Grid item xs={12} sm={6}>
//         <TextField
//           variant='outlined'
//           type='text'
//           label='Terrænkote'
//           InputLabelProps={{ shrink: true }}
//           fullWidth
//           margin='dense'
//         />
//       </Grid>
//       <Grid item xs={12} sm={6}>
//         <TextField
//           variant='outlined'
//           type='text'
//           label='Terrænkote'
//           InputLabelProps={{ shrink: true }}
//           fullWidth
//           margin='dense'
//         />
//       </Grid>
//     </Grid>
//   );
// }

// function StationForm(props) {
//   return (
//     <Grid container spacing={2}>
//       <Grid item xs={12} sm={6}>
//         <TextField
//           variant='outlined'
//           type='text'
//           label='Navn'
//           InputLabelProps={{ shrink: true }}
//           fullWidth
//           margin='dense'
//         />
//       </Grid>
//       <Grid item xs={12} sm={6}>
//         <TextField
//           variant='outlined'
//           type='text'
//           label='Type'
//           InputLabelProps={{ shrink: true }}
//           fullWidth
//           margin='dense'
//         />
//       </Grid>
//       <Grid item xs={12} sm={6}>
//         <TextField
//           variant='outlined'
//           type='text'
//           label=' Målepunktskote'
//           InputLabelProps={{ shrink: true }}
//           fullWidth
//           margin='dense'
//         />
//       </Grid>
//       <Grid item xs={12} sm={6}>
//         <TextField
//           variant='outlined'
//           type='text'
//           label='Evt. loggerdybde'
//           InputLabelProps={{ shrink: true }}
//           fullWidth
//           margin='dense'
//         />
//       </Grid>
//     </Grid>
//   );
// }

// function UdstyrForm(props) {
//   return (
//     <Grid container spacing={2}>
//       <Grid item xs={12} sm={6}>
//         <TextField
//           variant='outlined'
//           type='text'
//           label='Terminal'
//           InputLabelProps={{ shrink: true }}
//           fullWidth
//           margin='dense'
//         />
//       </Grid>
//       <Grid item xs={12} sm={6}>
//         <TextField
//           variant='outlined'
//           type='text'
//           label='Terminal ID'
//           InputLabelProps={{ shrink: true }}
//           fullWidth
//           margin='dense'
//         />
//       </Grid>
//       <Grid item xs={12} sm={6}>
//         <TextField
//           variant='outlined'
//           type='text'
//           label='CALYPSO ID'
//           InputLabelProps={{ shrink: true }}
//           fullWidth
//           margin='dense'
//         />
//       </Grid>
//       <Grid item xs={12} sm={6}>
//         <TextField
//           variant='outlined'
//           type='text'
//           label='Sensor'
//           InputLabelProps={{ shrink: true }}
//           fullWidth
//           margin='dense'
//         />
//       </Grid>
//       <Grid item xs={12} sm={6}>
//         <TextField
//           variant='outlined'
//           type='text'
//           label='Sensor ID'
//           InputLabelProps={{ shrink: true }}
//           fullWidth
//           margin='dense'
//         />
//       </Grid>
//     </Grid>
//   );
// }

export default function RetStamdata(props) {
  const [
    locality,
    setLocality,
    formData,
    setFormData,
    setValues,
    setLocationValue,
    setStationValue,
    setUdstyrValue,
    saveUdstyrFormData,
    saveLocationFormData,
  ] = React.useContext(StamdataContext);

  useEffect(() => {
    /*
    -get stamdata. choose the one corresponding to stationId.
    set that to formData.
     */
    getStamData().then((res) => {
      let st = res.data.data.find((s) => s.ts_id === props.stationId);
      saveLocationFormData(st);
    });
  }, []);
  return (
    <div>
      <Container fixed>
        <Typography variant='h6' component='h3'>
          Stamdata
        </Typography>
        <Typography>Lokalitet</Typography>
        <LocalityForm />
        <Typography>Station</Typography>
        <StationForm />
        <Typography>Udstyr</Typography>
        <UdstyrForm />
        <Grid container spacing={3}>
          <Grid item xs={4} sm={2}>
            <Button
              autoFocus
              style={{ backgroundColor: "#ffa137" }}
              onClick={() => {
                props.setFormToShow(null);
              }}
            >
              Gem
            </Button>
          </Grid>
          <Grid item xs={4} sm={2}>
            <Button
              autoFocus
              style={{ backgroundColor: "#ffa137" }}
              onClick={() => {
                props.setFormToShow(null);
              }}
            >
              Annullere
            </Button>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}
