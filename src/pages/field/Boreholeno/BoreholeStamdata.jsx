import {zodResolver} from '@hookform/resolvers/zod';
import {EditRounded, PhotoCameraRounded, Save} from '@mui/icons-material';
import {Box, Card, CardContent, Grid, InputAdornment, Typography} from '@mui/material';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useEffect, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {toast} from 'react-toastify';
import CaptureDialog from '~/components/CaptureDialog';
import FormInput from '~/components/FormInput';
import ConfirmCalypsoIDDialog from '~/pages/field/Boreholeno/components/ConfirmCalypsoIDDialog';
import * as z from 'zod';
import {apiClient} from '../../../apiClient';
import Button from '~/components/Button';

const BoreholeStamdata = ({boreholeno, intakeno, stamdata, setFormToShow}) => {
  const [openCamera, setOpenCamera] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [calypso_id, setCalypso_id] = useState(stamdata?.calypso_id);

  const queryClient = useQueryClient();

  const changeStamdata = useMutation({
    mutationFn: async (data) => {
      const {data: out} = await apiClient.put(
        `/sensor_field/borehole/stamdata/${boreholeno}/${intakeno}`,
        data
      );
      return out;
    },
    onSuccess: () => {
      queryClient.invalidateQueries('borehole_stamdata');
    },
  });

  const schema = z.object({
    calypso_id: z.number().int().min(1).optional().nullish(),
    num_controls_in_a_year: z
      .number()
      .int()
      .min(0, {message: 'Antal kontroller skal være 0 eller større'}),
    description: z.string().nullish().optional(),
  });

  const formMethods = useForm({
    resolver: zodResolver(schema),
    defaultValues: stamdata,
  });

  useEffect(() => {
    formMethods.reset(stamdata);
  }, [stamdata]);

  const handleUpdate = (values) => {
    toast.promise(() => changeStamdata.mutateAsync(values), {
      pending: 'Opdaterer stamdata...',
      success: 'Stamdata er opdateret',
      error: 'Der skete en fejl',
    });
    formMethods.reset(values);
  };

  const handleErrors = (errors) => {
    toast.error('Der skete en fejl', {
      autoClose: 2000,
    });
  };

  const handleScan = async (data) => {
    if (
      data?.text.includes('www.sensor.watsonc.dk/') ||
      data?.text.includes('https://sensor.watsonc.dk/')
    ) {
      const split = data['text'].split('/');
      setCalypso_id(Number(split[split.length - 1]));
      setOpenCamera(false);
      setOpenDialog(true);
    } else {
      toast.error('QR-koden er ikke gyldig', {
        autoClose: 2000,
      });
    }
  };

  const mode = 'edit';
  return (
    <>
      {openCamera && (
        <CaptureDialog
          open={openCamera}
          handleClose={() => setOpenCamera(false)}
          handleScan={handleScan}
        />
      )}
      {openDialog && (
        <ConfirmCalypsoIDDialog
          open={openDialog}
          setOpen={setOpenDialog}
          onConfirm={() => {
            formMethods.setValue('calypso_id', Number(calypso_id), {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
          calypso_id={calypso_id}
        />
      )}
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
          <FormProvider {...formMethods}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormInput name="description" label="Beskrivelse" fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormInput
                  name="num_controls_in_a_year"
                  label="Årlige kontroller"
                  fullWidth
                  type="number"
                  transform={(val) => parseInt(val)}
                  InputProps={{
                    endAdornment: <InputAdornment position="start">pr. år</InputAdornment>,
                    inputProps: {min: 0},
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{display: 'flex', justifyContent: 'left', alignItems: 'center', gap: 2}}>
                  <FormInput
                    name="calypso_id"
                    label="Calypso ID"
                    type="number"
                    fullWidth
                    disabled
                  />
                  <Button
                    sx={{
                      width: '80%',
                      textTransform: 'initial',
                      borderRadius: 15 
                    }}
                    variant="contained"
                    color="primary"
                    startIcon={<PhotoCameraRounded />}
                    onClick={() => setOpenCamera(true)}
                  >
                    {stamdata?.calypso_id ? 'Skift ID' : 'Tilføj ID'}
                  </Button>
                </Box>
                <Typography
                  variant="caption"
                  gutterBottom
                  sx={{
                    float: 'left',
                    textTransform: 'initial'
                  }}
                >
                  Calypso ID er et unikt nummer, der identificerer boringen samt indtag
                </Typography>
              </Grid>
            </Grid>
            <Grid container alignItems="center" justifyContent="center">
              <Grid item xs={12} sm={4}>
                <Box gap={1}>
                  <Button
                    btType="tertiary"
                    onClick={() => {
                      setFormToShow(null);
                    }}
                  >
                    Annuller
                  </Button>
                  <Button
                    autoFocus
                    btType="primary"
                    startIcon={<Save />}
                    onClick={formMethods.handleSubmit(handleUpdate, handleErrors)}
                    disabled={formMethods.formState.isSubmitting || !formMethods.formState.isDirty}
                  >
                    Gem stamdata
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </FormProvider>
        </CardContent>
      </Card>
    </>
  );
};

export default BoreholeStamdata;
