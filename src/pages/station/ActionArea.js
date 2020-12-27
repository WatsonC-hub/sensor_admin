import React, { useState } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
//import classes from '*.module.css';
import { Add, AddCircle, Camera, Edit, EditRounded, PhotoCamera, PhotoCameraRounded } from '@material-ui/icons';
import { Icon } from '@material-ui/core';
import AddBearingForm from './AddBearingForm';
//import classes from '*.module.css';

const useStyles = makeStyles((theme) => ({
    
    appBar: {
      top: 'auto',
      bottom: 0,
      
    },
    grow: {
      flexGrow: 1,
    },
    fabButton: {
      position: 'absolute',
      zIndex: 1,
      top: -30,
      left: 0,
      right: 0,
      margin: '0 auto',
    },
  }));

const IconButtonWithText = withStyles({
    color:"#ffa137",
    label: {
        flexDirection: 'column'
      }
})(Button);

const ColorButton = withStyles((theme) => ({
    root: {
      color: theme.palette.getContrastText("#ffa137"),
      backgroundColor: "#ffa137",
      '&:hover': {
        backgroundColor: "#ffa137",
      },
    },
  }))(Button);

export default function ActionArea(){
    const classes = useStyles();
    const [openDialog, setOpenDialog] = useState(false);

    return (
        <>
        <AppBar position="fixed" color="inherit" className={classes.appBar}>
            <Toolbar style={{display:"flex", justifyContent:"space-between"}}>
                <ColorButton  
                    onClick = {(e)  => {setOpenDialog(true)}}
                >
                    <AddCircle />
                    Indberet pejling
                </ColorButton>
                <ColorButton>
                    <EditRounded />
                    Ret stamdata
                </ColorButton>
                <ColorButton>
                    <PhotoCameraRounded />
                    Tag billede
                </ColorButton>
            </Toolbar>
        </AppBar>
        <AddBearingForm handleDialogClose={setOpenDialog}  dialogOpen={openDialog} />
        </>
    );
}