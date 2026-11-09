import {Stack, Typography} from '@mui/material';

import LogoSvg from '~/calypso.svg?react';
import Button from '~/components/Button';
import {authUrl} from '~/consts';

import {mayRedirectToLogin} from './loginRedirectGuard';

// What a visitor without a login sees. The login page is calypso-auth's, so the visitor presses a
// button to go there (instead of being sent at once and losing track of which app they opened). The
// login page names this app from the address it is sent back to.
export default function SignedOut({onLoginLoop}: {onLoginLoop: () => void}) {
  const logIn = () => {
    if (!mayRedirectToLogin(window.sessionStorage)) {
      onLoginLoop();
      return;
    }
    window.location.href = `${authUrl}/login?redirect_uri=${encodeURIComponent(window.location.href)}`;
  };

  return (
    <Stack
      spacing={3}
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        px: 2,
        textAlign: 'center',
        backgroundColor: 'primary.main',
        color: 'white',
      }}
    >
      <LogoSvg />
      <Typography variant="h4" component="h1">
        Calypso @ Field
      </Typography>
      <Typography>Log ind for at se dine stationer og tidsserier.</Typography>
      <Stack sx={{width: '100%', maxWidth: 360}}>
        <Button bttype="tertiary" size="large" onClick={logIn}>
          Log ind
        </Button>
      </Stack>
    </Stack>
  );
}
