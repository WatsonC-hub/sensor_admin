import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import daLocale from 'date-fns/locale/da';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AddBearingForm({dialogOpen, handleDialogClose}) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };


  return (
    <div>
      {/* <Button variant="outlined" color="primary" onClick={handleDialogOpen}>
        Open full-screen dialog
      </Button> */}
      <MuiPickersUtilsProvider utils={DateFnsUtils} locale={daLocale} >
      <Dialog fullScreen open={dialogOpen} onClose={(e) => handleDialogClose(false)} TransitionComponent={Transition}>
        <AppBar className={classes.appBar} style={{backgroundColor:'lightseagreen'}}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={(e) => handleDialogClose(false)} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Indberet ny pejling
            </Typography>
            <Button autoFocus style={{backgroundColor:"#ffa137"}}  onClick={(e) => handleDialogClose(false)}>
              Gem
            </Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="sm">
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <KeyboardDatePicker
                    disableToolbar
                    variant="inline"
                    format="yyyy-MM-dd"
                    margin="normal"
                    id="date-picker-inline"
                    label={
                        <Typography variant="h6" component="h3">Dato</Typography>
                    }
                    value={selectedDate}
                    onChange={handleDateChange}
                    KeyboardButtonProps={{
                        'aria-label': 'change date',
                    }}
                    />

                </Grid>
                <Grid item xs={6}>
                  <KeyboardTimePicker
                      margin="normal"
                      id="overnat_start_tid"
                      label={
                        <Typography variant="h6" component="h3">Tidspunkt</Typography>
                      }
                      value={selectedDate}
                      onChange={handleDateChange}
                      KeyboardButtonProps={{
                        'aria-label': 'change time',
                      }}
                    />
                  </Grid>
                  {/* <Grid item xs={6}></Grid> */}
            </Grid>

        </Container>
      </Dialog>
      </MuiPickersUtilsProvider>
    </div>
  );
}
