import {Box, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from '@mui/material';
import {useMutation} from '@tanstack/react-query';
import React, {MouseEventHandler} from 'react';
import {toast} from 'react-toastify';

import Button from '~/components/Button';
import {createUser} from '~/features/login/api/fieldApi';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {FormData} from '~/types';

type Props = {
  openConfirmDialog: boolean;
  openAwaitDialog: boolean;
  setOpenConfirmDialog: (setOpen: boolean) => void;
  isSuccess: boolean;
  cvrData?: CvrData;
  handleSubmit: (
    handleConfirm: (formData: FormData) => void
  ) => MouseEventHandler<HTMLButtonElement>;
  setOpenAwaitDialog: (awaitOpen: boolean) => void;
};

type CvrData = {
  id: number;
  name: string;
  address: string;
  zip: number;
  city: string;
};

export default function CvrDialog({
  openConfirmDialog,
  openAwaitDialog,
  handleSubmit,
  cvrData,
  isSuccess,
  setOpenConfirmDialog,
  setOpenAwaitDialog,
}: Props) {
  const {home} = useNavigationFunctions();

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success('Bruger oprettet');
      setOpenAwaitDialog(true);
    },
    onError: () => {
      toast.error('Bruger kunne ikke oprettes');
    },
  });

  const routeChange = () => {
    // navigate(`/`);
    home();
  };

  const handleConfirm = ({firstName, lastName, email, checkedNews, checkedTerms}: FormData) => {
    setOpenConfirmDialog(false);
    const payload = {
      aux: {
        calypso: {
          mail: checkedNews,
          acceptterms: checkedTerms,
          license: 'free',
        },
      },
      email: email,
      firstName: firstName,
      lastName: lastName,
      id: -1,
      org: cvrData,
      userName: email,
    };

    createUserMutation.mutate(payload);
  };

  const handleClose = () => {
    setOpenConfirmDialog(false);
  };
  return (
    <Box>
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
          <Button onClick={handleClose} bttype="tertiary">
            Annuller
          </Button>
          <Button onClick={handleSubmit(handleConfirm)} bttype="primary">
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
          <Button onClick={routeChange} bttype="primary">
            Til log ind
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
