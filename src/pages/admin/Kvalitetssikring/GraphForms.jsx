import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Plot from 'react-plotly.js';
import moment from 'moment';
import axios from 'axios';
import {useQuery} from '@tanstack/react-query';
import {stamdataStore} from '../../../state/store';
import {apiClient} from 'src/pages/field/fieldAPI';
import React, {useEffect, useState} from 'react';
import {Grid, Typography, TextField, Button, Card, CardContent, Alert} from '@mui/material';
import OwnDatePicker from 'src/components/OwnDatePicker';
import {isValid} from 'date-fns';

export default function GraphForms({graphData, formData, changeFormData}) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));
  const [disablePreview, setDisablePreview] = useState(false);

  console.log('graphdata:', graphData);

  const handleMinDateChange = (date) => {
    if (isValid(date)) {
      console.log('date is valid again: ', date);
      changeFormData('minDate', date);
    }
  };

  const handleMaxDateChange = (date) => {
    if (isValid(date)) {
      console.log('date is valid again: ', date);
      changeFormData('maxDate', date);
    }
  };

  const handleClickPreview = () => {
    setDisablePreview(true);

    if (graphData.length > 0) {
      var newData = graphData.filter((elem) => {
        if (
          moment(elem.x).isSameOrAfter(formData.minDate) &&
          moment(elem.x).isBefore(formData.maxDate)
        ) {
          return true;
        }
      });
      console.log('newData', newData);
      changeFormData('data', {newData});
      setTimeout(() => {
        window.scrollTo({top: document.documentElement.scrollHeight, behavior: 'smooth'});
      }, 200);
      setTimeout(() => {
        setDisablePreview(false);
      }, 2500);
    }
  };

  return (
    <div
      style={{
        width: 'auto',
        height: matches ? '300px' : '500px',
        marginBottom: '10px',
        marginTop: '-10px',
        //paddingTop: '5px',
        //border: '2px solid gray',
        // position: "-webkit-sticky",
        // position: "sticky",
        // top: 20,
        // zIndex: 100,
      }}
    >
      <Grid container spacing={3} alignItems="center" justifyContent="center">
        <Grid item xs={12} sm={12} display="flex" justifyContent="center">
          <Alert
            severity="info"
            sx={{
              width: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* <Typography>
              Valgt minimums dato: {formData.minDate?.format('YYYY-MM-DD HH:mm')}
            </Typography>
            <Typography>
              Valgt maksimums dato: {formData.maxDate?.format('YYYY-MM-DD HH:mm')}
            </Typography> */}
          </Alert>
        </Grid>
        <Card
          style={{marginTop: 15, marginBottom: 15}}
          sx={{
            textAlign: 'center',
            justifyContent: 'center',
            alignContent: 'center',
          }}
        >
          <CardContent>
            <Typography>Ekskluder data</Typography>
            <Grid item xs={12} sm={7}>
              <OwnDatePicker
                sx={{
                  '& .MuiInputLabel-root': {color: 'primary.main'}, //styles the label
                  '& .MuiOutlinedInput-root': {
                    '& > fieldset': {borderColor: 'primary.main'},
                  },
                }}
                label={
                  <Typography variant="h6" component="h3">
                    Minimums dato
                  </Typography>
                }
                value={formData.minDate}
                onChange={(date) => handleMinDateChange(date)}
              />
            </Grid>
            <Grid item xs={12} sm={7}>
              <OwnDatePicker
                sx={{
                  '& .MuiInputLabel-root': {color: 'primary.main'}, //styles the label
                  '& .MuiOutlinedInput-root': {
                    '& > fieldset': {borderColor: 'primary.main'},
                  },
                }}
                label={
                  <Typography variant="h6" component="h3">
                    Maksimums dato
                  </Typography>
                }
                value={formData.maxDate}
                onChange={(date) => handleMaxDateChange(date)}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <Button
                color="secondary"
                variant="contained"
                onClick={handleClickPreview}
                disabled={disablePreview}
              >
                Se preview
              </Button>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </div>
  );
}
