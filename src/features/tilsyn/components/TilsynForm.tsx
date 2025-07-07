import {BatteryAlertRounded, RemoveRedEyeRounded} from '@mui/icons-material';
import SaveIcon from '@mui/icons-material/Save';
import {Box, Card, CardContent, Grid, Typography} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import {Controller, useFormContext} from 'react-hook-form';

import Button from '~/components/Button';
import FormDateTime from '~/components/FormDateTime';
import FormInput from '~/components/FormInput';
import {TilsynSchemaType} from '~/pages/field/station/tilsyn/Tilsyn';

interface TilsynFormPops {
  handleServiceSubmit: (values: TilsynSchemaType) => void;
  cancel: () => void;
}

export default function TilsynForm({handleServiceSubmit, cancel}: TilsynFormPops) {
  const {getValues, control, handleSubmit} = useFormContext<TilsynSchemaType>();
  return (
    <Card
      style={{marginBottom: 25}}
      sx={{
        width: {xs: '100%'},
        textAlign: 'center',
        maxWidth: 600,
        justifyContent: 'center',
        alignContent: 'center',
        alignSelf: 'center',
      }}
    >
      <CardContent>
        <Typography gutterBottom variant="h5" component="h2">
          {getValues('gid') !== -1 ? 'Opdater tilsyn' : 'Indberet tilsyn'}
        </Typography>
        <Grid container spacing={3} alignItems="center" justifyContent="center">
          <Grid item xs={12} sm={7}>
            <FormDateTime name="dato" label="Dato for tilsyn" sx={{mb: 2}} />
          </Grid>
          <Grid item xs={12} sm={7}>
            <Controller
              control={control}
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
              control={control}
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
            <FormInput
              name="kommentar"
              label="Kommentar"
              required
              fullWidth
              multiline
              rows={4}
              sx={{
                mb: 2,
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
                onClick={handleSubmit((onvalid) => {
                  console.log('onvalid', onvalid);
                  handleServiceSubmit(onvalid);
                })}
                startIcon={<SaveIcon />}
              >
                Gem
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
