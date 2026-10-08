import {Stack, Typography} from '@mui/material';

import {apiClient} from '~/apiClient';
import Button from '~/components/Button';

import {forgetLoginRedirect} from './loginRedirectGuard';

// Shown instead of a second redirect to the login page (see loginRedirectGuard.ts): the visitor has
// been to calypso-auth and is back, but this app still has no user for them.
export default function SignInProblem() {
  const tryAgain = () => {
    forgetLoginRedirect(window.sessionStorage);
    window.location.reload();
  };

  // ends the session, so the next visit starts with a clean login
  const logOut = async () => {
    try {
      await apiClient.get('/auth/logout/secure');
    } finally {
      forgetLoginRedirect(window.sessionStorage);
      window.location.reload();
    }
  };

  return (
    <Stack spacing={2} sx={{alignItems: 'center', mt: 8, px: 2, textAlign: 'center'}}>
      <Typography variant="h4" component="h1">
        Du kunne ikke logges ind
      </Typography>
      <Typography>
        Du er logget ind, men Field kunne ikke hente din bruger. Prøv igen om lidt, eller log ud og
        ind igen. Kontakt WatsonC, hvis det bliver ved.
      </Typography>
      <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} sx={{width: {xs: '100%', sm: 'auto'}}}>
        <Button bttype="primary" size="large" onClick={tryAgain}>
          Prøv igen
        </Button>
        <Button bttype="tertiary" size="large" onClick={logOut}>
          Log ud
        </Button>
      </Stack>
    </Stack>
  );
}
