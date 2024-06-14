import {BatteryAlertRounded, RemoveRedEyeRounded} from '@mui/icons-material';
import SaveIcon from '@mui/icons-material/Save';
import {Box, Card, CardContent, Grid, TextField, Typography} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import moment from 'moment';
import {Controller, FormProvider, UseFormReturn} from 'react-hook-form';

import Button from '~/components/Button';
import OwnDatePicker from '~/components/OwnDatePicker';
import {TilsynItem} from '~/types';

interface TilsynFormPops {
  handleServiceSubmit: (values: TilsynItem) => void;
  cancel: () => void;
  formMethods: UseFormReturn<TilsynItem>;
}

export default function TilsynForm({handleServiceSubmit, cancel, formMethods}: TilsynFormPops) {
  return (
    <FormProvider {...formMethods}>
      <Card
        style={{marginBottom: 25}}
        sx={{
          width: {xs: '100%', sm: '60%'},
          textAlign: 'center',
          justifyContent: 'center',
          alignContent: 'center',
          alignSelf: 'center',
        }}
      >
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {formMethods.getValues('gid') !== -1 ? 'Opdater tilsyn' : 'Indberet tilsyn'}
          </Typography>
          <Grid container spacing={3} alignItems="center" justifyContent="center">
            <Grid item xs={12} sm={7}>
              <Controller
                control={formMethods.control}
                defaultValue={moment().format('YYYY-MM-DDTHH:mm')}
                name="dato"
                rules={{required: true}}
                render={({field}) => {
                  return (
                    <OwnDatePicker
                      label="Dato"
                      value={field.value}
                      inputRef={field.ref}
                      onChange={(e: string) => {
                        field.onChange(moment(e).format('YYYY-MM-DDTHH:mm'));
                        formMethods.setValue('dato', moment(e).format('YYYY-MM-DDTHH:mm'));
                      }}
                    />
                  );
                }}
              />
            </Grid>
            <Grid item xs={12} sm={7}>
              <Controller
                control={formMethods.control}
                name="batteriskift"
                rules={{required: false}}
                render={({field}) => {
                  return (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={(checked) => field.onChange(checked)}
                          name="checkedBattery"
                          color="primary"
                        />
                      }
                      label={
                        <Box display="flex">
                          <BatteryAlertRounded sx={{color: 'grey.700'}} />
                          <Typography alignSelf="center">Batteriskift</Typography>
                        </Box>
                      }
                    />
                  );
                }}
              />
              <Controller
                control={formMethods.control}
                name="tilsyn"
                rules={{required: false}}
                render={({field}) => {
                  return (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={(checked) => field.onChange(checked)}
                          name="checkedService"
                          color="primary"
                        />
                      }
                      label={
                        <Box display="flex" gap={1}>
                          <RemoveRedEyeRounded sx={{color: 'grey.700'}} />
                          <Typography alignSelf="center">Tilsyn</Typography>
                        </Box>
                      }
                    />
                  );
                }}
              />
            </Grid>
            <Grid item xs={12} sm={10}>
              <Controller
                control={formMethods.control}
                name="kommentar"
                rules={{required: false}}
                render={({field}) => {
                  return (
                    <TextField
                      label={
                        <Typography variant="h6" component="h3">
                          Kommentar
                        </Typography>
                      }
                      value={field.value}
                      variant="outlined"
                      multiline
                      rows={4}
                      InputLabelProps={{shrink: true}}
                      fullWidth
                      onChange={field.onChange}
                    />
                  );
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box display="flex" gap={1} justifyContent={{xs: 'flex-end', sm: 'center'}}>
                <Button bttype="tertiary" onClick={cancel}>
                  Annuller
                </Button>
                <Button
                  bttype="primary"
                  onClick={formMethods.handleSubmit(handleServiceSubmit)}
                  startIcon={<SaveIcon />}
                >
                  Gem
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </FormProvider>
  );
}
