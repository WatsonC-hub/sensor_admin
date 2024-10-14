import {zodResolver} from '@hookform/resolvers/zod';
import {EditRounded, PhotoCameraRounded, Save} from '@mui/icons-material';
import {Box, Card, CardContent, Grid, InputAdornment, Typography} from '@mui/material';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useEffect, useState} from 'react';
import {Controller, FormProvider, useForm} from 'react-hook-form';
import {toast} from 'react-toastify';
import * as z from 'zod';

import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import CaptureDialog from '~/components/CaptureDialog';
import FormInput from '~/components/FormInput';
import ConfirmCalypsoIDDialog from '~/pages/field/boreholeno/components/ConfirmCalypsoIDDialog';
import LocationGroups from '~/features/stamdata/components/stamdata/LocationGroups';

const schema = z.object({
  calypso_id: z.number().int().min(1).optional().nullish(),
  num_controls_in_a_year: z
    .number()
    .int()
    .min(0, {message: 'Antal kontroller skal være 0 eller større'})
    .nullish(),
  description: z.string().nullish().optional(),
  groups: z
    .array(
      z.object({
        id: z.string(),
        group_name: z.string(),
      })
    )
    .nullish(),
});

type Stamdata = z.infer<typeof schema>;

interface BoreholeStamdataProps {
  boreholeno: string;
  intakeno: number;
  stamdata: Stamdata;
}

const BoreholeStamdata = ({boreholeno, intakeno, stamdata}: BoreholeStamdataProps) => {
  const [openCamera, setOpenCamera] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [calypso_id, setCalypso_id] = useState(stamdata?.calypso_id);

  const queryClient = useQueryClient();

  const changeStamdata = useMutation({
    mutationFn: async (data: Stamdata) => {
      const {data: out} = await apiClient.put(
        `/sensor_field/borehole/stamdata/${boreholeno}/${intakeno}`,
        data
      );
      return out;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['borehole_stamdata'],
      });
    },
  });

  const formMethods = useForm<Stamdata>({
    resolver: zodResolver(schema),
    defaultValues: stamdata,
  });

  useEffect(() => {
    formMethods.reset(stamdata);
  }, [stamdata]);

  const handleUpdate = (values: Stamdata) => {
    toast.promise(() => changeStamdata.mutateAsync(values), {
      pending: 'Opdaterer stamdata...',
      success: 'Stamdata er opdateret',
      error: 'Der skete en fejl',
    });
    formMethods.reset(values);
  };

  const handleErrors = () => {
    toast.error('Der skete en fejl', {
      autoClose: 2000,
    });
  };

  const handleScan = async (data: any) => {
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

  return (
    <Box sx={{mt: 2}}>
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
          width: {xs: window.innerWidth, md: 1080},
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
                <Controller
                  name="groups"
                  control={formMethods.control}
                  render={({field: {onChange, value, onBlur}}) => (
                    <LocationGroups value={value} setValue={onChange} onBlur={onBlur} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormInput
                  name="num_controls_in_a_year"
                  label="Årlige kontroller"
                  fullWidth
                  type="number"
                  // transform={(val) => parseInt(val)}
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
                      borderRadius: 15,
                    }}
                    bttype="primary"
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
                    textTransform: 'initial',
                  }}
                >
                  Calypso ID er et unikt nummer, der identificerer boringen samt indtag
                </Typography>
              </Grid>
            </Grid>
            <Grid container alignItems="center" justifyContent="center">
              <Grid item xs={12} sm={4}>
                <Box display="flex" gap={1} justifyContent={{xs: 'flex-end', sm: 'center'}}>
                  <Button
                    bttype="tertiary"
                    onClick={() => {
                      formMethods.reset(stamdata);
                    }}
                  >
                    Annuller
                  </Button>
                  <Button
                    bttype="primary"
                    startIcon={<Save />}
                    onClick={formMethods.handleSubmit(handleUpdate, handleErrors)}
                    disabled={formMethods.formState.isSubmitting || !formMethods.formState.isDirty}
                  >
                    Gem
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </FormProvider>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BoreholeStamdata;
