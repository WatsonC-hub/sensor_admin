import {useState, useEffect} from 'react';
import {
  Grid,
  MenuItem,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  InputAdornment,
} from '@mui/material';
import {EditRounded, Save, PhotoCameraRounded} from '@mui/icons-material';
import FormInput from 'src/components/FormInput';
import {useQueryClient, useMutation} from '@tanstack/react-query';
import {apiClient} from '../../../apiClient';
import {useForm, FormProvider} from 'react-hook-form';
import {toast} from 'react-toastify';
import CaptureDialog from 'src/components/CaptureDialog';
import ConfirmCalypsoIDDialog from 'src/pages/field/Boreholeno/components/ConfirmCalypsoIDDialog';

const BoreholeStamdata = ({boreholeno, intakeno, stamdata, setFormToShow}) => {
  const [openCamera, setOpenCamera] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [calypso_id, setCalypso_id] = useState(stamdata?.calypso_id);

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

  const formMethods = useForm({
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
  };

  const handleScan = async (data) => {
    if (
      data?.text.includes('www.sensor.watsonc.dk/') ||
      data?.text.includes('https://sensor.watsonc.dk/')
    ) {
      const split = data['text'].split('/');
      setCalypso_id(split[split.length - 1]);
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
            formMethods.setValue('calypso_id', calypso_id);
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
                <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2}}>
                  <FormInput name="calypso_id" label="Calypso ID" fullWidth disabled required />
                  <Button
                    sx={{
                      width: '80%',
                    }}
                    variant="contained"
                    color="secondary"
                    startIcon={<PhotoCameraRounded />}
                    onClick={() => setOpenCamera(true)}
                  >
                    {stamdata?.calypso_id ? 'Skift ID' : 'Tilføj ID'}
                  </Button>
                </Box>
                <Typography variant="caption" display="block" gutterBottom>
                  Calypso ID er et unikt nummer, der identificerer boringen
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormInput
                  name="num_controls_in_a_year"
                  label="Årlige kontroller"
                  fullWidth
                  type="number"
                  required
                  InputProps={{
                    endAdornment: <InputAdornment position="start">pr. år</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
            <Grid container alignItems="center" justifyContent="center">
              <Grid item xs={4} sm={4}>
                <Button
                  autoFocus
                  color="secondary"
                  variant="contained"
                  startIcon={<Save />}
                  onClick={formMethods.handleSubmit(handleUpdate, handleUpdate)}
                  disabled={formMethods.formState.isSubmitting || !formMethods.formState.isDirty}
                >
                  Gem
                </Button>
              </Grid>
              <Grid item xs={4} sm={4}>
                <Button
                  color="grey"
                  variant="contained"
                  onClick={() => {
                    setFormToShow(null);
                  }}
                >
                  Annuller
                </Button>
              </Grid>
            </Grid>
          </FormProvider>
        </CardContent>
      </Card>
    </>
  );
};

export default BoreholeStamdata;
