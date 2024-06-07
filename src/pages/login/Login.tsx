import {Typography} from '@mui/material';
import Container from '@mui/material/Container';
import React, {useState} from 'react';

import Button from '~/components/Button';
import LoginForm from '~/features/login/components/LoginForm';
import ResetPasswordForm from '~/features/login/components/ResetPasswordForm';

export default function Login() {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  return (
    <div>
      <div
        style={{
          textAlign: 'center',
          alignSelf: 'center',
        }}
      >
        <Typography variant="h4">Log ind</Typography>
      </div>

      <Container fixed maxWidth="sm">
        <Typography
          style={{
            textAlign: 'center',
            alignSelf: 'center',
          }}
        >
          Med denne applikation kan du indberette pejlinger, se grafer og flytte rundt på dit
          udstyr.
        </Typography>
        <LoginForm />
        <Button bttype="tertiary" onClick={handleClickOpen} style={{marginTop: '1.5%'}}>
          Glemt kodeord?
        </Button>
      </Container>
      <ResetPasswordForm open={open} setOpen={setOpen} />
    </div>
  );
}
