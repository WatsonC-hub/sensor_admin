import React from "react";
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

function Locality(props) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='text'
          label='Navn'
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='text'
          label='X-koordinat (UTM)'
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='text'
          label='Y-koordinat (UTM)'
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='text'
          label='Terrænkote'
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
    </Grid>
  );
}

function StationForm(props) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='text'
          label='Navn'
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='text'
          label='Type'
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='text'
          label=' Målepunktskote'
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='text'
          label='Evt. loggerdybde'
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
    </Grid>
  );
}

function UdstyrForm(props) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='text'
          label='Terminal'
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='text'
          label='Terminal ID'
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='text'
          label='CALYPSO ID'
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='text'
          label='Sensor'
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='text'
          label='Sensor ID'
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
    </Grid>
  );
}

function EditStamdata() {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState("panel1");

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={daLocale}>
      <Typography variant='h6' component='h3'>
        Stamdata
      </Typography>
      <div className={classes.root}>
        <Accordion
          expanded={expanded === "panel1"}
          onChange={handleChange("panel1")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls='panel1bh-content'
            id='panel1bh-header'
          >
            <Typography className={classes.heading}>Lokalitet</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Locality />
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === "panel2"}
          onChange={handleChange("panel2")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls='panel2bh-content'
            id='panel2bh-header'
          >
            <Typography className={classes.heading}>Station</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <StationForm />
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === "panel3"}
          onChange={handleChange("panel3")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls='panel3bh-content'
            id='panel3bh-header'
          >
            <Typography className={classes.heading}>Udstyr</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <UdstyrForm />
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === "panel4"}
          onChange={handleChange("panel4")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls='panel4bh-content'
            id='panel4bh-header'
          >
            <Typography className={classes.heading}>Period</Typography>
          </AccordionSummary>
          <AccordionDetails></AccordionDetails>
        </Accordion>
      </div>
    </MuiPickersUtilsProvider>
  );
}

export default function RestStamdata(props) {
  return (
    <div>
      <Typography variant='h6' component='h3'>
        Stamdata
      </Typography>
      <Typography>Lokalitet</Typography>
      <Locality />
      <Typography>Station</Typography>
      <StationForm />
      <Typography>Udstyr</Typography>
      <UdstyrForm />
      <Typography>Period</Typography>
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
    </div>
  );
}
