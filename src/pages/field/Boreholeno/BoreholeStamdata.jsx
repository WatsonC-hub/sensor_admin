import React, {useEffect} from 'react';
import {Grid, MenuItem, Typography, Box, Button, Card, CardContent} from '@mui/material';
import {EditRounded, Save} from '@mui/icons-material';
import {InputAdornment} from '@mui/material';
import {stamdataStore} from 'src/state/store';
import FormTextField from 'src/pages/field/Stamdata/components/FormTextField';
import {useQueryClient, useMutation} from '@tanstack/react-query';
import useFormData from '../../../hooks/useFormData';
import {apiClient} from '../../../apiClient';

const BoreholeStamdata = ({boreholeno, intakeno, stamdata}) => {
  const [formData, setFormData, changeFormData, resetFormData] = useFormData(
    stamdata
      ? stamdata
      : {
          local_number: '',
          borehole_description: '',
          borehole_type: -1,
          intake_description: '',
        }
  );

  useEffect(() => {
    if (stamdata) {
      setFormData(stamdata);
    }
  }, [stamdata]);

  const queryClient = useQueryClient();
  const changeStamdata = useMutation(
    async (data) => {
      const {data: out} = await apiClient.post(
        `/sensor_field/borehole/stamdata/${boreholeno}/${intakeno}`,
        data
      );
      return out;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('borehole_stamdata');
      },
    }
  );

  const mode = 'edit';
  return (
    <Card
      sx={{
        width: {xs: '100%', sm: '60%'},
        ml: {xs: '0%', sm: '20%'},
        textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
          }}
        >
          <EditRounded />
          <Typography gutterBottom variant="h5" component="h2">
            Stamdata
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {/* <Typography>Hej</Typography> */}
          <Grid item xs={12} sm={3}>
            <FormTextField
              select
              label="Type af boring"
              value={formData.borehole_type}
              onChange={(event) => changeFormDataalue('borehole_type', event.target.value)}
            >
              <MenuItem value={-1}> Vælg type </MenuItem>
              <MenuItem value={1}>Pejleboring</MenuItem>
              <MenuItem value={2}>Pumpeboring</MenuItem>
            </FormTextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormTextField
              label="Lokal nummer"
              value={formData.local_number}
              onChange={(event) => {
                changeFormData('local_number', event.target.value);
              }}
              placeholder="f.eks. 23.16"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormTextField
              label="DGU beskrivelse"
              value={formData.borehole_description}
              onChange={(event) => changeFormDataalue('borehole_description', event.target.value)}
              placeholder="f.eks. ejes af"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormTextField
              label="Indtags beskrivelse"
              value={formData.intake_description}
              onChange={(event) => changeFormDataalue('intake_description', event.target.value)}
              placeholder="f.eks. det sorte rør"
            />
          </Grid>
        </Grid>
        <Button
          color="secondary"
          variant="contained"
          startIcon={<Save />}
          onClick={() => {
            changeStamdata.mutate(formData);
          }}
        >
          Gem
        </Button>
      </CardContent>
    </Card>
  );
};

export default BoreholeStamdata;
