import React, {useState, useEffect} from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';

import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import {getCvr, createUser} from 'src/pages/field/fieldAPI';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import {Typography} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import {useQuery, useMutation} from '@tanstack/react-query';
import * as z from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import RegisterForm from './RegisterForm';

const RegisterSchema = z.object({
  firstName: z
    .string({required_error: 'Fornavn er påkrævet'})
    .min(2, 'Fornavn skal være længere end 2 tegn')
    .max(50, 'Fornavn må ikke være længere end 50 tegn'),
  lastName: z
    .string({required_error: 'Efternavn er påkrævet'})
    .min(2, 'Efternavn skal være længere end 2 tegn')
    .max(50, 'Efternavn må ikke være længere end 50 tegn'),
  email: z
    .string({required_error: 'Email er påkrævet'})
    .min(1, 'Email er påkrævet')
    .email('Email er ugyldig'),
  cvr: z
    .string({required_error: 'CVR er påkrævet'})
    .min(8, 'CVR skal være 8 tegn langt')
    .max(8, 'CVR skal være 8 tegn langt'),
  checkedTerms: z.literal(true, {
    errorMap: () => ({message: 'Du skal acceptere betingelserne for at oprette en konto'}),
  }),
  checkedNews: z.boolean().optional().default(false),
});

export default function Register() {
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openAwaitDialog, setOpenAwaitDialog] = useState(false);

  const formMethods = useForm({
    resolver: zodResolver(RegisterSchema),
  });

  const {
    formState: {errors, isSubmitSuccessful, values},
    reset,
    getValues,
    handleSubmit,
  } = formMethods;

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        cvr: '',
        checkedTerms: false,
        checkedNews: false,
      });
    }
  }, [isSubmitSuccessful]);

  const navigate = useNavigate();
  const routeChange = () => {
    navigate(`/`);
  };

  const {
    data: cvrData,
    isSuccess,
    refetch,
  } = useQuery(['cvr'], () => getCvr(getValues('cvr')), {
    enabled: false,
    refetchOnWindowFocus: false,
    select: (data) => {
      return {
        ...data.data.orgs[0],
        id: data.data.orgs[0].id !== null ? data.data.orgs[0].id : -1,
      };
    },
    onError: (error) => {
      toast.error('CVR ikke gyldigt');
    },
  });

  const createUserMutation = useMutation(createUser, {
    onSuccess: (data) => {
      toast.success('Bruger oprettet');
      setOpenAwaitDialog(true);
    },
    onError: (error) => {
      toast.error('Bruger kunne ikke oprettes');
    },
  });

  const handleOpret = (e) => {
    e.preventDefault(); //To avoid refreshing page on button click
    refetch();
    setOpenConfirmDialog(true);
  };

  const handleConfirm = (values) => {
    setOpenConfirmDialog(false);
    const payload = {
      aux: {
        calypso: {
          mail: values.checkedNews,
          acceptterms: values.checkedTerms,
          license: 'free',
        },
      },
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      id: -1,
      org: cvrData,
      userName: values.email,
    };

    console.log(payload);

    createUserMutation.mutate(payload);
  };

  const handleClose = () => {
    setOpenConfirmDialog(false);
  };

  return (
    <div className="form">
      <div
        style={{
          textAlign: 'center',
          alignSelf: 'center',
        }}
      >
        <Typography variant="h4">Opret konto</Typography>
      </div>

      <RegisterForm onSubmitHandler={handleOpret} formMethods={formMethods} />

      <Dialog
        open={openConfirmDialog && isSuccess}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <Typography variant="h5">Bekræft virksomhed</Typography>
        </DialogTitle>
        <DialogContent>
          <div>
            <Typography>
              {cvrData?.id === -1
                ? 'Denne organisation er ikke oprettet. Du vil blive ejeren af den nedenstående organisation og skal fremad rettet godkende andre brugere der tilknytter sig denne organisation. Følg instruktionerne i din email for at fuldføre oprettelsen.'
                : 'Virksomheden er allerede oprettet. Der vil blive sendt en anmodning til nedenstående virksomhed, om at du kan oprettes i denne. Hvorefter du vil modtage en bekræftigelsesmail.'}
            </Typography>
            <Typography>
              {cvrData?.name}
              <br></br>
              {cvrData?.address}
              <br></br>
              {cvrData?.zip + ' ' + cvrData?.city}
              <br></br>
              {/* {cvr} */}
            </Typography>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Annuller
          </Button>
          <Button
            onClick={handleSubmit(handleConfirm)}
            variant="outlined"
            color="primary"
            autoFocus
          >
            Bekræft
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openAwaitDialog}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <Typography variant="h5">Afventer fuldførelse</Typography>
        </DialogTitle>
        <DialogContent>
          <div>
            <Typography>
              For at fuldføre oprettelsen, følg instruktionerne i din email. Tjek eventuelt spam,
              hvis du ikke kan finde mailen.
            </Typography>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={routeChange} variant="outlined" color="primary" autoFocus>
            Til log ind
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
