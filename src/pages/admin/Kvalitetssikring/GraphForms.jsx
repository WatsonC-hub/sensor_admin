import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Plot from 'react-plotly.js';
import moment from 'moment';
import axios from 'axios';
import {useQuery} from '@tanstack/react-query';
import {stamdataStore} from '../../../state/store';
import {apiClient} from 'src/pages/field/fieldAPI';
import React, {useEffect, useState} from 'react';
import {Grid, Typography, TextField, Button, Box, Alert} from '@mui/material';
import OwnDatePicker from 'src/components/OwnDatePicker';
import {isValid} from 'date-fns';
import OptionsCard from './OptionsCard';

export default function GraphForms({graphData, previewData, reviewData, setReviewData}) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));
  const [disablePreview, setDisablePreview] = useState(false);
  const [disableReview, setDisableReview] = useState(true);

  console.log('graphdata:', graphData);

  const options = [
    {
      type: 'dateTime',
      label: 'newDate',
      name: 'exclude-data',
    },
    {
      type: 'double',
      label: 'min-max cutoff',
      name: 'minmax-data',
    },
  ];

  const formStyle = {
    '& .MuiInputLabel-root': {color: 'primary.main'}, //styles the label
    '& .MuiOutlinedInput-root': {
      '& > fieldset': {borderColor: 'primary.main'},
    },
  };

  const handleClickPreview = () => {
    if (previewData.selectedDataFix) {
      setDisablePreview(true);
      setReviewData({
        x: graphData.x.filter(
          (coordinate, index) =>
            !previewData.selectedDataFix.x.includes(coordinate) ||
            previewData.selectedDataFix.y.indexOf(graphData.y[index]) === -1
        ),
        y: graphData.y.filter(
          (coordinate, index) =>
            !previewData.selectedDataFix.y.includes(coordinate) ||
            previewData.selectedDataFix.x.indexOf(graphData.x[index]) === -1
        ),
      });
      console.log('reviewData', reviewData);

      setTimeout(() => {
        window.scrollTo({top: 0, behavior: 'smooth'});
      }, 200);
      setTimeout(() => {
        setDisablePreview(false);
      }, 2500);
      setDisableReview(false);
    }
  };

  return (
    <div
      style={{
        width: 'auto',
        height: matches ? '300px' : '500px',
        marginBottom: '10px',
        marginTop: '-10px',
        flexGrow: 1,
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
            <Typography>
              Ældste valgte dato: {previewData.oldDate?.format('DD-MM-YYYY HH:mm')}
            </Typography>
            <Typography>
              Nyeste valgte dato: {previewData.newDate?.format('DD-MM-YYYY HH:mm')}
            </Typography>
          </Alert>
        </Grid>
        <Grid item xs={6} sm={6} lg={'auto'}>
          <OptionsCard title={'exclude-data'} handleClick={handleClickPreview}>
            <OwnDatePicker
              sx={formStyle}
              label={
                <Typography variant="h6" component="h3">
                  Ældste dato
                </Typography>
              }
              value={previewData.oldDate}
              onChange={(date) => handleOldDateChange(date)}
            />
            <OwnDatePicker
              sx={formStyle}
              label={
                <Typography variant="h6" component="h3">
                  Nyeste dato
                </Typography>
              }
              value={previewData.newDate}
              onChange={(date) => handleNewDateChange(date)}
            />
          </OptionsCard>
        </Grid>
        <Grid item xs={6} sm={6} lg={'auto'}>
          <OptionsCard title={'minmax-cutoff'}>
            <TextField
              sx={formStyle}
              type="number"
              variant="outlined"
              style={{marginTop: '1%', padding: 3}}
              label={
                <Typography variant="h6" component="h3">
                  Min cutoff
                </Typography>
              }
              InputLabelProps={{shrink: true}}
              //value={}
            />
            <TextField
              sx={formStyle}
              style={{marginTop: '5%', marginBottom: '2%'}}
              type="number"
              variant="outlined"
              label={
                <Typography variant="h6" component="h3">
                  Max cutoff
                </Typography>
              }
              InputLabelProps={{shrink: true}}
              //value={}
            />
          </OptionsCard>
        </Grid>
      </Grid>
      {!disableReview ? (
        <Grid item xs={12} sm={12}>
          <Button
            color="secondary"
            variant="contained"
            //onClick={handleClickPreview}
            disabled={disableReview}
          >
            Bekræft ændringer
          </Button>
        </Grid>
      ) : (
        ''
      )}
    </div>
  );
}
